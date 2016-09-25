/**
 * Created by Alex on 9/24/2016.
 */
var FeedValidator = function () {
    this.editor = null;
    this.btn = null;
};

FeedValidator.prototype.load = function (){
    $.validator.setDefaults({
        highlight: function(element) {
            $(element).closest('.form-group').addClass('has-error');
            $('.btn-validate').button('reset');
        },
        unhighlight: function(element) {
            $(element).closest('.form-group').removeClass('has-error');
        },
        errorElement: 'span',
        errorClass: 'help-block',
        errorPlacement: function(error, element) {
            if(element.parent('.input-group').length) {
                error.insertAfter(element.parent());
            } else {
                error.insertAfter(element);
            }
        }
    });
    $( '.validate' ).validate({
        rules: {
            feed_url: {
                required: true,
                url: true,
                minlength: 10
            }
        }
    });
    $('.btn-validate').on('click', function () {
        this.btn = $(this).button('loading');
    });
    if(typeof CodeMirror !== 'undefined') {
        this.editor = CodeMirror(document.getElementById('codemirror'), {
            value: $('.cleancode').html(),
            mode: "xml",
            readOnly: true,
            styleActiveLine: true,
            lineNumbers: true,
            theme: 'dracula'
        });
    }
};


var FV = new FeedValidator();

FV.load();
