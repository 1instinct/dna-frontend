import assert from "node:assert/strict";
import { describe, test } from "node:test";
import type { AppLink, AppLinkKind, AppPlatform } from "../appLinks";
import { appCalloutCopy, resolveAppLinks } from "../appLinks";

// resolveAppLinks falls back to the env links by default; these tests pass the
// fallback explicitly so the shell's NEXT_PUBLIC_* values never matter.
const BETA = "https://testflight.apple.com/join/abc123";
const IOS_STORE = "https://apps.apple.com/app/id000000000";
const ANDROID_STORE =
  "https://play.google.com/store/apps/details?id=com.example.app";
const envBeta = { ios_url: BETA, android_url: "" };
const noEnv = { ios_url: "", android_url: "" };

const link = (platform: AppPlatform, kind: AppLinkKind): AppLink => ({
  platform,
  kind,
  href: "https://example.com/app",
  label: "x"
});

describe("resolveAppLinks", () => {
  test("falls back to the env iOS url when there is no override", () => {
    const links = resolveAppLinks(null, envBeta);
    assert.equal(links.length, 1);
    assert.equal(links[0].platform, "ios");
    assert.equal(links[0].href, BETA);
    assert.equal(links[0].kind, "beta");
    assert.equal(links[0].label, "Join the iOS beta");
  });

  test("no override and no env means no links", () => {
    assert.deepEqual(resolveAppLinks(null, noEnv), []);
  });

  test("an admin override wins over env", () => {
    const links = resolveAppLinks({ ios_url: IOS_STORE }, envBeta);
    assert.equal(links[0].kind, "store");
    assert.equal(links[0].label, "Get the iOS app");
    assert.equal(links[0].href, IOS_STORE);
  });

  test("an empty or whitespace override falls back to env", () => {
    assert.equal(resolveAppLinks({ ios_url: "   " }, envBeta)[0].kind, "beta");
  });

  test("android is omitted entirely when override and env are both empty", () => {
    const links = resolveAppLinks({ android_url: "" }, envBeta);
    assert.deepEqual(
      links.map((l) => l.platform),
      ["ios"]
    );
  });

  test("an android override is labelled as a store link", () => {
    const links = resolveAppLinks({ android_url: ANDROID_STORE }, envBeta);
    const android = links.find((l) => l.platform === "android");
    assert.equal(android?.kind, "store");
    assert.equal(android?.label, "Get the Android app");
  });

  test("store labels carry no Apple or Google badge-lockup wording", () => {
    const labels = resolveAppLinks(
      { ios_url: IOS_STORE, android_url: ANDROID_STORE },
      noEnv
    ).map((l) => l.label);
    assert.deepEqual(labels, ["Get the iOS app", "Get the Android app"]);
  });

  test("ios comes before android", () => {
    const links = resolveAppLinks(
      { ios_url: IOS_STORE, android_url: ANDROID_STORE },
      noEnv
    );
    assert.deepEqual(
      links.map((l) => l.platform),
      ["ios", "android"]
    );
  });

  test("a malformed href is dropped rather than rendered", () => {
    assert.deepEqual(
      resolveAppLinks({ ios_url: "not a url" }, envBeta).map((l) => l.kind),
      ["beta"]
    );
    assert.deepEqual(resolveAppLinks({ ios_url: "not a url" }, noEnv), []);
  });

  test("a non-http(s) scheme is rejected and falls back to the env link", () => {
    const links = resolveAppLinks({ ios_url: "javascript:alert(1)" }, envBeta);
    assert.equal(links[0].kind, "beta");
    assert.equal(links[0].href, BETA);
  });
});

describe("appCalloutCopy", () => {
  test("beta-only: says beta, never 'out now'", () => {
    const copy = appCalloutCopy([link("ios", "beta"), link("android", "beta")]);
    assert.equal(copy.heading, "Try the app beta");
    assert.equal(copy.body, "The app beta is open on iPhone and Android.");
    assert.ok(!/out now/i.test(copy.body));
  });

  test("store-only: says out now, never 'beta'", () => {
    const copy = appCalloutCopy([
      link("ios", "store"),
      link("android", "store")
    ]);
    assert.equal(copy.heading, "Get the app");
    assert.equal(copy.body, "The app is out now on iPhone and Android.");
    assert.ok(!/beta/i.test(copy.heading + copy.body));
  });

  test("iOS-only never implies Android exists", () => {
    const beta = appCalloutCopy([link("ios", "beta")]);
    assert.equal(beta.body, "The app beta is open on iPhone.");
    assert.ok(!/android/i.test(beta.heading + beta.body));

    const store = appCalloutCopy([link("ios", "store")]);
    assert.equal(store.body, "The app is out now on iPhone.");
    assert.ok(!/android/i.test(store.heading + store.body));
  });

  test("Android-only never implies iOS exists", () => {
    const beta = appCalloutCopy([link("android", "beta")]);
    assert.equal(beta.body, "The app beta is open on Android.");
    assert.ok(!/iphone|ios/i.test(beta.heading + beta.body));

    const store = appCalloutCopy([link("android", "store")]);
    assert.equal(store.body, "The app is out now on Android.");
    assert.ok(!/iphone|ios/i.test(store.heading + store.body));
  });

  test("mixed: launch copy that still calls the beta platform a beta", () => {
    const copy = appCalloutCopy([
      link("ios", "store"),
      link("android", "beta")
    ]);
    assert.equal(copy.heading, "Get the app");
    assert.equal(
      copy.body,
      "The app is out now on iPhone, with a beta on Android."
    );
  });

  test("no links names no platform and claims nothing", () => {
    const copy = appCalloutCopy([]);
    assert.ok(!/iphone|ios|android/i.test(copy.heading + copy.body));
    assert.ok(!/out now/i.test(copy.body));
  });

  test("copy follows what the admin actually resolved to", () => {
    assert.equal(
      appCalloutCopy(resolveAppLinks(null, envBeta)).body,
      "The app beta is open on iPhone."
    );
    assert.equal(
      appCalloutCopy(resolveAppLinks({ ios_url: IOS_STORE }, envBeta)).body,
      "The app is out now on iPhone."
    );
  });
});
