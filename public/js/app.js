const addingLoader = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                     Adding...`;

const generalLoader = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>`;
         

const showModal = (selector) => {
   $("label.error").hide();
   $(".error").removeClass("error");
   
   $(selector).modal();
}

const hideModal = (selector) => {
   $(selector).modal("hide");
}

const showSuccess = (options) => {
   toastr.success(options.content);
}

const showError = (options) => {
   toastr.error(options.content);
}

const showLoader = (selector, options) => {
   document.querySelector(selector).innerHTML = options.content;
   document.querySelector(selector).disabled = true;
}

const hideLoader = (selector, options) => {
   document.querySelector(selector).innerHTML = options.content;
   document.querySelector(selector).disabled = false;
}



