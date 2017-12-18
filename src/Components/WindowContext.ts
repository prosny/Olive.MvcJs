import Url from 'olive/Components/Url'
import Form from 'olive/Components/Form'
import Waiting from 'olive/Components/Waiting'

export default class WindowContext {
    static initialize() {
        window["isModal"] = () => WindowContext.isWindowModal();
        window["getContainerIFrame"] = () => WindowContext.findContainerIFrame();
    }

    static events: { [event: string]: Function[] } = {};

    static findContainerIFrame() {
        if (parent == null || parent == self) return null;
        else return <HTMLIFrameElement>$(parent.document).find("iframe")
            .filter((i, f: any) => (f.contentDocument || f.contentWindow.document) == document).get(0);
    }

    static isWindowModal() {
        if ($(window.getContainerIFrame()).closest(".modal").length === 0) return false;
        return true;
    }

    public static expandModalToFitPicker(target: any) {
        var datepicker = $(target.currentTarget).siblings('.bootstrap-datetimepicker-widget');

        if (datepicker.length === 0) {
            this.adjustModalHeight();
            return;
        }

        var offset = Math.ceil(datepicker.offset().top + datepicker[0].offsetHeight) - document.body.offsetHeight + 6;
        var overflow = Math.max(offset, 0);
        this.adjustModalHeight(overflow);
    }

    public static adjustModalHeight(overflow?: number) {
        if (window.isModal()) {
            var frame = $(window.getContainerIFrame());
            if (frame.attr("data-has-explicit-height") != 'true')
                frame.height(document.body.offsetHeight + (overflow || 0));
        }
    }

    public static handleAjaxResponseError(response) {
        Waiting.hidePleaseWait();
        console.error(response);

        var text = response.responseText;
        if (text.indexOf("<html") > -1) {
            document.write(text);
        }
        else if (text.indexOf("<form") > -1) {
            var form = $("form", document);
            if (form.length) form.replaceWith($(text));
            else document.write(text);
        }
        else alert(text);
    }

    public static toJson(data) {
        try {
            return JSON.parse(data);
        } catch (error) {
            console.log(error);
            console.log('Cannot parse this data to Json: ');
            console.log(data);
        }
    }

    public static applyColumns(event: JQueryEventObject) {
        var button = $(event.currentTarget);
        var checkboxes = button.closest(".select-cols").find(":checkbox");
        if (checkboxes.length === 0 || checkboxes.filter(":checked").length > 0) return;
        $("<input type='checkbox' checked='checked'/>").hide().attr("name", checkboxes.attr("name")).val("-")
            .appendTo(button.parent());
    }

    public static enableSelectColumns(container) {
        var columns = container.find("div.select-cols");
        container.find("a.select-cols").click(() => { columns.show(); return false; });
        columns.find('.cancel').click(() => columns.hide());
    }

    public static enableSelectAllToggle(event) {
        var trigger = $(event.currentTarget);
        trigger.closest("table").find("td.select-row > input:checkbox").prop('checked', trigger.is(":checked"));
    }

    public static enableUserHelp(element: JQuery) {
        element.click(() => false);
        var message = element.attr('data-user-help');  // todo: unescape message and conver to html
        element['popover']({ trigger: 'focus', content: message });
    }

    public static handleDefaultButton(event: JQueryEventObject): boolean {
        if (event.which === 13) {
            var target = $(event.currentTarget);
            var button = target.closest("[data-module]").find('[default-button]:first'); // Same module
            if (button.length == 0) button = $('[default-button]:first') // anywhere
            button.click();
            return false;
        } else return true;
    }

    public static paginationSizeChanged(event: Event) {
        $(event.currentTarget).closest("form").submit();
    }

    public static enableAjaxPaging(event: JQueryEventObject) {
        var button = $(event.currentTarget);
        var page = button.attr("data-pagination");
        var key = "p";

        if (page.split('=').length > 1) { key = page.split('=')[0]; page = page.split('=')[1]; }

        var input = $("[name='" + key + "']");
        input.val(page);
        if (input.val() != page) {
            // Drop down list case
            input.parent().append($("<input type='hidden'/>").attr("name", key).val(page));
            input.remove();
        }
    }

    public static adjustIFrameHeightToContents(iframe) {
        $(iframe).height(iframe.contentWindow.document.body.scrollHeight);
    }

    public static cleanUpNumberField(field: JQuery) {
        var domElement = <HTMLInputElement>field.get(0);
        // var start = domElement.selectionStart;
        // var end = domElement.selectionEnd;
        field.val(field.val().replace(/[^\d.-]/g, ""));
        // domElement.setSelectionRange(start, end);
    }

    public static ensureModalResize() {
        setTimeout(() => this.adjustModalHeight(), 1);
    }
}