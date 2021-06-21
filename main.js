function csRouter(domNode, queryPath) {
    this.domNode = document.querySelector(domNode);
    this.routes = [];
    this.queryPath = queryPath;
    this.actions = {
        HTML: function ({ isUrl, html }, params) {
            this.params = params;
            window.params = params;
            if (isUrl) {
                fetch(html)
                    .then((res) => res.text())
                    .then((htmlString) => {
                        this.domNode.innerHTML = htmlString;
                    });
            } else {
                this.domNode.innerHTML = html;
            }
        },
        js: function ({ name }, params) {
            this.route = name;
            this.params = params;
            let event = new CustomEvent("path", { detail: { route: name, params } });
            window.dispatchEvent(event);
            return;
        }
    };
}
Router.prototype.validateAndParseURL = function (url1, url2) {
    const paramsIndexs = [];
    const url1Filtred = url1.split("/").filter((val, index) => {
        if (val.startsWith(":")) {
            paramsIndexs.push({ index: index, name: val.replace(":", "") });
            return false;
        }
        return true;
    });

    const params = {};
    const url2Filtred = url2.split("/").filter((val, index) => {
        let isParam = true;
        paramsIndexs.forEach((value) => {
            if (index == value.index) {
                if (val != "") {
                    params[value.name] = val;
                    isParam = false;
                }
            }
        });
        return isParam;
    });
    if (url1Filtred.join("/") == url2Filtred.join("/")) {
        return { isSame: true, params: params };
    } else {
        return { isSame: false, params: {} };
    }
};
Router.prototype.getSearchParam = function (paramName) {
    var searchString = window.location.search.substring(1),
        i,
        val,
        params = searchString.split("&");
    for (i = 0; i < params.length; i++) {
        val = params[i].split("=");
        if (val[0] == paramName) {
            return val[1];
        }
    }
    return null;
};
Router.prototype.render = function () {
    try {
        this.routes.forEach((val, index) => {
            const result = this.validateAndParseURL(
                val.url,
                this.getSearchParam(this.queryPath)
            );
            if (!result.isSame) return;
            const action = this.actions[val.type];
            if (!action || typeof action != "function")
                return console.warn(
                    `didn't find valid action for route with ${val.url} with type ${val.type}, skipping`
                );
            action.call(this, val, result.params);
            throw {}; //just for breaking out from the loop
        });
    } catch (e) {}
};
/*//addRouteArgs: args needed in the function called to add custom route (router.[name](args) => push route object with args in routes), actionFn: function will be called when your custom type (type) will be parsed, function will be called with route object and founded params as argument
Router.prototype.extendRoutes = function(addRouteArgs, name, actionFn, type) {
  let addRouteFn = new Function(
    ...addRouteArgs,
    `this.routes.push({type: ${type},${addRouteArgs.join(",")}})`
  );
  Router.prototype[name] = addRouteFn.bind(this);
  this.actions[type] = actionFn.bind(this);
}*/
//isUrl: false: use directly html, true: fetch html (url)
Router.prototype.html = function (url, isUrl, html) {
    this.routes.push({ url, isUrl, html, type: "HTML" });
};
//name: router.route and event.route = name
Router.prototype.js = function (url, name) {
    this.routes.push({ url, name, type: "js" });
};
export default csRouter;
