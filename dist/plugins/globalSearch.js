define(["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var GlobalSearchFactory = /** @class */ (function () {
        function GlobalSearchFactory(waiting) {
            this.waiting = waiting;
        }
        GlobalSearchFactory.prototype.enable = function (selector) {
            var _this = this;
            selector.each(function (i, e) { return new GlobalSearch($(e), _this.waiting).enable(); });
        };
        return GlobalSearchFactory;
    }());
    exports.GlobalSearchFactory = GlobalSearchFactory;
    var GlobalSearch = /** @class */ (function () {
        function GlobalSearch(input, waiting) {
            this.input = input;
            this.waiting = waiting;
            this.isMouseInsideSearchPanel = false;
            this.isTyping = false;
            this.searchedText = null;
        }
        GlobalSearch.prototype.boldSearch = function (str, searchText) {
            var ix = -1;
            var result = "";
            if (str !== null && str !== undefined) {
                str = str.replace(/<strong>/gi, "↨↨").replace(/<\/strong>/gi, "↑↑");
                var strlower = str.toLowerCase();
                if (searchText !== "" && searchText !== null && searchText !== undefined) {
                    var stxt = searchText.toLowerCase();
                    do {
                        var ixNext = strlower.indexOf(stxt, ix);
                        if (ixNext < 0) {
                            break;
                        }
                        if (ix < 0) {
                            result = str.substr(0, ixNext);
                        }
                        result += (ix >= 0 ? str.substr(ix, ixNext - ix) : "") +
                            "<strong>" +
                            str.substr(ixNext, stxt.length) + "</strong>";
                        ix = ixNext + stxt.length;
                    } while (true);
                }
                result += (ix < 0 ? str : str.substr(ix, str.length - ix));
                result = result.replace(/↨↨/gi, "<strong>").replace(/↑↑/gi, "</strong>");
            }
            return result;
        };
        GlobalSearch.prototype.boldSearchAll = function (str, searchText) {
            var result = str;
            if (searchText !== null && searchText !== undefined) {
                var splitedsearchtext = searchText.split(" ");
                for (var _i = 0, splitedsearchtext_1 = splitedsearchtext; _i < splitedsearchtext_1.length; _i++) {
                    var strST = splitedsearchtext_1[_i];
                    result = this.boldSearch(result, strST);
                }
            }
            return result;
        };
        GlobalSearch.prototype.enable = function () {
            var _this = this;
            if (this.input.is("[data-globalsearch-enabled=true]")) {
                return;
            }
            else {
                this.input.attr("data-globalsearch-enabled", "true");
            }
            this.input.wrap("<div class='global-search-panel'></div>");
            var urlsList = (this.input.attr("data-search-source") || "").split(";");
            this.urlList = urlsList;
            var timeout = null;
            this.input.keyup(function (e) {
                if (e.keyCode === 27) {
                    return;
                }
                _this.isTyping = true;
                clearTimeout(timeout);
                timeout = setTimeout((function () {
                    _this.isTyping = false;
                    if (_this.searchedText !== _this.input.val().trim()) {
                        _this.createSearchComponent(_this.urlList);
                    }
                }), 300);
            });
            this.input.on("blur", (function (e) {
                if (_this.isMouseInsideSearchPanel === false) {
                    _this.clearSearchComponent();
                }
            }));
        };
        GlobalSearch.prototype.clearSearchComponent = function () {
            var inputholder = this.input.parent();
            if (inputholder !== undefined) {
                var panel = inputholder.find(".global-search-result-panel");
                if (panel !== undefined) {
                    panel.empty();
                    panel.remove();
                }
            }
        };
        GlobalSearch.prototype.getResultPanel = function () {
            var _this = this;
            var searchPanel = this.input.parent();
            var resultPanel = searchPanel.find(".global-search-result-panel");
            if (resultPanel === undefined || resultPanel === null || resultPanel.length === 0) {
                resultPanel = $("<div class='global-search-result-panel'>")
                    .mouseenter(function () { return _this.isMouseInsideSearchPanel = true; })
                    .mouseleave(function () { return _this.isMouseInsideSearchPanel = false; });
                searchPanel.append(resultPanel);
            }
            else {
                resultPanel.show();
            }
            $(window).on("keydown", function (e) {
                if (e.keyCode === 27) {
                    resultPanel.hide(null, function () {
                        $(window).off("keydown");
                    });
                    $('input[name=searcher]').val('');
                }
            });
            return resultPanel;
        };
        GlobalSearch.prototype.createSearchComponent = function (urls) {
            var _this = this;
            this.searchedText = this.input.val().trim();
            var resultPanel = this.getResultPanel();
            resultPanel.empty();
            var searchHolder = $("<div class='search-container'>");
            this.waiting.show();
            var ajaxList = urls.map(function (p) {
                var icon = p.split("#")[1].trim();
                return {
                    url: p.split("#")[0].trim(),
                    icon: icon,
                    state: AjaxState.pending,
                };
            });
            var context = {
                ajaxList: ajaxList,
                resultCount: 0,
                resultPanel: resultPanel,
                searchHolder: searchHolder,
                beginSearchStarted: true,
                searchedText: this.searchedText,
            };
            var _loop_1 = function (ajaxObject) {
                ajaxObject.ajx = $
                    .ajax({
                    dataType: "json",
                    url: ajaxObject.url,
                    xhrFields: { withCredentials: true },
                    async: true,
                    data: { searcher: context.searchedText },
                    success: function (result) { return _this.onSuccess(ajaxObject, context, result); },
                    complete: function (jqXhr) { return _this.onComplete(context, jqXhr); },
                    error: function (jqXhr) { return _this.onError(ajaxObject, resultPanel, jqXhr); },
                });
            };
            for (var _i = 0, _a = context.ajaxList; _i < _a.length; _i++) {
                var ajaxObject = _a[_i];
                _loop_1(ajaxObject);
            }
        };
        GlobalSearch.prototype.onSuccess = function (sender, context, result) {
            var _this = this;
            if (this.isTyping === false) {
                sender.result = result;
                if (result !== null && result !== undefined && typeof (result) === typeof ([])) {
                    sender.state = AjaxState.success;
                    var resultfiltered = result.filter(function (p) { return _this.isValidResult(p, context); });
                    var searchItem = this.createSearchItems(sender, context, resultfiltered);
                    context.searchHolder.append(searchItem);
                    if (context.beginSearchStarted && resultfiltered.length > 0) {
                        context.beginSearchStarted = false;
                        context.resultPanel.append(context.searchHolder);
                    }
                }
                else {
                    sender.state = AjaxState.failed;
                    console.error("ajax success but failed to decode the response -> wellform expcted response is like this: [{Title:'',Description:'',IconUrl:'',Url:''}] ");
                }
            }
        };
        GlobalSearch.prototype.isValidResult = function (item, context) {
            var resfilter = false;
            if (context.searchedText) {
                var arfilter = context.searchedText.split(" ");
                for (var _i = 0, arfilter_1 = arfilter; _i < arfilter_1.length; _i++) {
                    var strfilter = arfilter_1[_i];
                    if (((item.Description !== null &&
                        item.Description !== undefined &&
                        item.Description.match(new RegExp(strfilter, "gi")) !== null) ||
                        item.Title.match(new RegExp(strfilter, "gi")) !== null)) {
                        resfilter = true;
                        break;
                    }
                }
            }
            else {
                resfilter = true;
            }
            return resfilter;
        };
        GlobalSearch.prototype.createSearchItems = function (sender, context, items) {
            var _a;
            var searchItem = $("<div class='search-item'>");
            var groupTitle = ((items === null || items === void 0 ? void 0 : items.length) > 0 && ((_a = items[0].GroupTitle) === null || _a === void 0 ? void 0 : _a.length) > 0) ? items[0].GroupTitle : sender.url.split(".")[0].replace("https://", "").replace("http://", "").toUpperCase();
            var searchTitleHolder = $("<div class='search-title'>");
            if ((items === null || items === void 0 ? void 0 : items.length) > 0 && items[0].Colour) {
                searchItem.css("color", items[0].Colour);
                searchTitleHolder.css("color", items[0].Colour);
            }
            var searhTitle = searchTitleHolder.append($("<i>").attr("class", sender.icon)).append(groupTitle);
            searchItem.append(searhTitle);
            var childrenItems = $("<ul>");
            for (var i = 0; i < items.length && i < 10; i++) {
                context.resultCount++;
                childrenItems.append(this.createItem(items[i], context));
            }
            searchItem.append(childrenItems);
            if (items.length === 0) {
                searchItem.addClass("d-none");
            }
            return searchItem;
        };
        GlobalSearch.prototype.createItem = function (item, context) {
            return $("<li>")
                .append((item.IconUrl === null || item.IconUrl === undefined) ?
                $("<div class='icon'>") : this.showIcon(item))
                .append($("<a href='" + item.Url + "'>")
                .html(this.boldSearchAll(item.Title, context.searchedText)))
                .append($(" <div class='desc'>").html(item.Description));
        };
        GlobalSearch.prototype.onComplete = function (context, jqXHR) {
            if (context.ajaxList.filter(function (p) { return p.state === 0; }).length === 0) {
                this.waiting.hide();
                if (context.resultCount === 0) {
                    var ulNothing = $("<ul>");
                    ulNothing.append("<li>").append("<span>").html("Nothing found");
                    context.resultPanel.append(ulNothing);
                }
            }
        };
        GlobalSearch.prototype.onError = function (sender, resultPanel, jqXHR) {
            sender.state = AjaxState.failed;
            var ulFail = $("<ul>");
            ulFail.append($("<li>").append($("<span>")
                .html("ajax failed Loading data from source [" + sender.url + "]")));
            resultPanel.append(ulFail);
            console.error(jqXHR);
        };
        GlobalSearch.prototype.showIcon = function (item) {
            if (item.IconUrl.indexOf("fa-") > 0) {
                return $("<div class='icon'>").append($("<i class='" + item.IconUrl + "'></i>"));
            }
            else {
                return $("<div class='icon'>").append($("<img src='" + item.IconUrl + "'>"));
            }
        };
        return GlobalSearch;
    }());
    exports.default = GlobalSearch;
    var AjaxState;
    (function (AjaxState) {
        AjaxState[AjaxState["pending"] = 0] = "pending";
        AjaxState[AjaxState["success"] = 1] = "success";
        AjaxState[AjaxState["failed"] = 2] = "failed";
    })(AjaxState = exports.AjaxState || (exports.AjaxState = {}));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2xvYmFsU2VhcmNoLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3BsdWdpbnMvZ2xvYmFsU2VhcmNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0lBRUE7UUFDSSw2QkFBb0IsT0FBZ0I7WUFBaEIsWUFBTyxHQUFQLE9BQU8sQ0FBUztRQUNwQyxDQUFDO1FBRU0sb0NBQU0sR0FBYixVQUFjLFFBQWdCO1lBQTlCLGlCQUVDO1lBREcsUUFBUSxDQUFDLElBQUksQ0FBQyxVQUFDLENBQUMsRUFBRSxDQUFDLElBQUssT0FBQSxJQUFJLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUE3QyxDQUE2QyxDQUFDLENBQUM7UUFDM0UsQ0FBQztRQUNMLDBCQUFDO0lBQUQsQ0FBQyxBQVBELElBT0M7SUFQWSxrREFBbUI7SUFTaEM7UUErQ0ksc0JBQW9CLEtBQWEsRUFBVSxPQUFnQjtZQUF2QyxVQUFLLEdBQUwsS0FBSyxDQUFRO1lBQVUsWUFBTyxHQUFQLE9BQU8sQ0FBUztZQTdDbkQsNkJBQXdCLEdBQVksS0FBSyxDQUFDO1lBQzFDLGFBQVEsR0FBWSxLQUFLLENBQUM7WUFDMUIsaUJBQVksR0FBVyxJQUFJLENBQUM7UUEyQzJCLENBQUM7UUF6Q3RELGlDQUFVLEdBQXBCLFVBQXFCLEdBQVcsRUFBRSxVQUFrQjtZQUNoRCxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNaLElBQUksTUFBTSxHQUFXLEVBQUUsQ0FBQztZQUN4QixJQUFJLEdBQUcsS0FBSyxJQUFJLElBQUksR0FBRyxLQUFLLFNBQVMsRUFBRTtnQkFDbkMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBRXBFLElBQU0sUUFBUSxHQUFHLEdBQUcsQ0FBQyxX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