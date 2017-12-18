export default class OlivePage {
    DATE_FORMAT: string;
    TIME_FORMAT: string;
    DATE_TIME_FORMAT: string;
    MINUTE_INTERVALS: number;
    DISABLE_BUTTONS_DURING_AJAX: boolean;
    DATE_LOCALE: string;
    REDIRECT_SCROLLS_UP: boolean;
    AUTOCOMPLETE_INPUT_DELAY: number;
    DEFAULT_HTML_EDITOR_MODE: string;
    DEFAULT_MODAL_BACKDROP: string;
    modal: any;
    constructor();
    _initializeActions: any[];
    onInit(action: any): void;
    _preInitializeActions: any[];
    onPreInit(action: any): void;
    pageLoad(container?: JQuery, trigger?: any): void;
    initializeUpdatedPage(container?: JQuery, trigger?: any): void;
    initialize(): void;
    skipNewWindows(): void;
    enableDragSort(container: any): void;
    enablePasswordStengthMeter(container: any): void;
    configureValidation(): void;
    updateSubFormStates(): void;
    enableDateDropdown(input: any): void;
    openLinkModal(event: JQueryEventObject): boolean;
    toJson(data: any): any;
    runStartupActions(container?: JQuery, trigger?: any, stage?: string): void;
    canAutoFocus(input: JQuery): boolean;
    awaitingAutocompleteResponses: number;
    returnToPreviousPage(target: any): boolean;
    cleanGetFormSubmit(event: JQueryEventObject): boolean;
    executeActions(actions: any, trigger?: any): void;
    executeAction(action: any, trigger: any): boolean;
    closeCurrentModal(refreshParrent?: boolean): any;
    openModal(event: any, url?: any, options?: any): void;
    executeNotifyAction(action: any, trigger: any): void;
    executeRedirectAction(action: any, trigger: any): void;
    replaceListControlSource(controlId: string, items: any): void;
    download(url: string): void;
    openWindow(url: string, target: string): void;
    refresh(keepScroll?: boolean): void;
    dynamicallyLoadedScriptFiles: any[];
    replaceMain(element: JQuery, trigger: any): void;
    invokeAjaxActionResult(response: any, containerModule: any, trigger: any): void;
    ensureNonModal(): void;
    enableSlider(input: any): void;
    reloadValidationRules(form: JQuery): void;
    highlightRow(element: any): void;
}