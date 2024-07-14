export function focusOnFirstMenuItem() {
  const firstItem = Array.from(
    document.getElementsByClassName("bm-item")
  ).shift();
  if (firstItem) {
    (firstItem as HTMLElement).focus();
  }
}

export function focusOnLastMenuItem() {
  const lastItem = Array.from(document.getElementsByClassName("bm-item")).pop();
  if (lastItem) {
    (lastItem as HTMLElement).focus();
  }
}

export function focusOnCrossButton() {
  const crossButton = document.getElementById("react-burger-cross-btn");
  if (crossButton) {
    crossButton.focus();
  }
}

export function focusOnMenuButton() {
  const menuButton = document.getElementById("react-burger-menu-btn");
  if (menuButton) {
    menuButton.focus();
  }
}

export function focusOnMenuItem(
  siblingType: keyof typeof document.activeElement
) {
  if (document?.activeElement?.className.includes("bm-item")) {
    const sibling = <HTMLElement>document.activeElement[siblingType];
    if (sibling) {
      sibling.focus();
    } else {
      focusOnCrossButton();
    }
  } else {
    if (siblingType === "previousElementSibling") {
      focusOnLastMenuItem();
    } else {
      focusOnFirstMenuItem();
    }
  }
}

export function focusOnNextMenuItem() {
  focusOnMenuItem("nextElementSibling" as keyof typeof document.activeElement);
}

export function focusOnPreviousMenuItem() {
  focusOnMenuItem(
    "previousElementSibling" as keyof typeof document.activeElement
  );
}
