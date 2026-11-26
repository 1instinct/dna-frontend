import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { productArrowDirection, ARROW_KEY_OWNERS } from "../arrowKeyNav";

// A target whose closest() matches when it is one of `owners`.
const target = (owner: boolean) => ({
  closest: (selector: string) => {
    assert.equal(selector, ARROW_KEY_OWNERS);
    return owner ? {} : null;
  }
});
const doc = (modalOpen: boolean) => ({
  querySelector: () => (modalOpen ? {} : null)
});

describe("productArrowDirection", () => {
  it("maps Left and Right on the page to previous and next", () => {
    assert.equal(productArrowDirection({ key: "ArrowLeft" }), -1);
    assert.equal(productArrowDirection({ key: "ArrowRight" }), 1);
    assert.equal(
      productArrowDirection(
        { key: "ArrowRight", target: target(false) },
        doc(false)
      ),
      1
    );
  });

  it("ignores other keys", () => {
    for (const key of ["ArrowUp", "ArrowDown", "Enter", " ", "a"]) {
      assert.equal(productArrowDirection({ key }), 0, key);
    }
  });

  it("leaves the arrows to fields, sliders and carousels", () => {
    assert.equal(
      productArrowDirection({ key: "ArrowLeft", target: target(true) }),
      0
    );
  });

  it("does nothing while a modal dialog is open", () => {
    assert.equal(productArrowDirection({ key: "ArrowLeft" }, doc(true)), 0);
  });

  it("ignores handled events and modifier chords", () => {
    assert.equal(
      productArrowDirection({ key: "ArrowLeft", defaultPrevented: true }),
      0
    );
    for (const mod of ["altKey", "ctrlKey", "metaKey", "shiftKey"]) {
      assert.equal(
        productArrowDirection({ key: "ArrowRight", [mod]: true }),
        0,
        mod
      );
    }
  });
});
