import Swal from "sweetalert2";

export const Alert = Swal.mixin({
  customClass: {
    // container: 'container-class',
    // popup: 'popup-class',
    // header: 'header-class',
    // title: 'title-class',
    // closeButton: 'close-button-class',
    icon: "alert-icon",
    // image: 'image-class',
    // content: 'content-class',
    // input: 'input-class',
    // actions: 'actions-class',
    confirmButton: "alert-confirm"
    // cancelButton: 'cancel-button-class',
    // footer: 'footer-class'
  },
  buttonsStyling: false
});
