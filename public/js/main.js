/**
 * Created by Alex on 9/24/2016.
 */
var FeedValidator = function () {
    this.editor = null;
    this.btnValidate = null;
    this.btnPreview = null;
};

FeedValidator.prototype.load = function (){
    FeedValidator.btnValidate = $('.btn-validate');
    FeedValidator.btnPreview = $('.btn-preview');
    $.validator.setDefaults({
        highlight: function(element) {
            $(element).closest('.form-group').addClass('has-error');
            FeedValidator.btnValidate.button('reset');
            FeedValidator.btnPreview.button('reset');
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
    FeedValidator.btnValidate.on('click', function (e) {
        FeedValidator.btnValidate.button('loading');
    });
    FeedValidator.btnPreview.on('click', function (e) {
        FeedValidator.btnPreview.button('loading');
        $(this).parents('form')
            .attr('action', '/preview')
            .trigger('submit');
    });

    if(typeof CodeMirror !== 'undefined') {
        CodeMirror.commands.jumpToLine = function(cm) {
            var line = Number(prompt("Where", ""));
            if (!isNaN(line)) cm.setCursor(line, 0);
        };
        FeedValidator.editor = CodeMirror.fromTextArea(document.getElementById('codemirror'), {
            mode: "xml",
            readOnly: true,
            styleActiveLine: true,
            lineNumbers: true,
            theme: 'dracula'
        });
    }

    function jumpToLine(i) {
        var t = FeedValidator.editor.charCoords({line: i, ch: 0}, "local").top;
        var middleHeight = FeedValidator.editor.getScrollerElement().offsetHeight / 2;
        FeedValidator.editor.scrollTo(null, middleHeight - 5 - t);
        FeedValidator.editor.setCursor({line: i, ch: 0});// t - middleHeight - 5
        console.log('jumpToLine', t, middleHeight, middleHeight - 5 - t)
    }

    $('.goToLine').click(function(e){
        e.preventDefault();
        var line = $(this).data('line');
        jumpToLine(line);
    });

};


var FV = new FeedValidator();

FV.load();
