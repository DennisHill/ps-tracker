window.createAjaxFn = function (url) {
    var ins;

    function stringify(obj) {
        var rs;
        try {
            rs = JSON.stringify(obj);
        } catch (e) {
            return;
        }
        return rs;
    }

    function parse(obj) {
        var rs;
        try {
            rs = JSON.parse(obj);
        } catch (e) {
            return;
        }
        return rs;
    }

    function Ajax(url) {
        this.url = url;
    }
    Ajax.prototype.post = function (url, params, success, fail) {
        if (success == null && fail == null && typeof params == "function") {
            success = params;
            params = null;
        }
        if (typeof params == "string" || typeof params == "number") {
            params = [params];
        }
        var arr = url.split(".");
        var xhr = new XMLHttpRequest();
        var params = stringify(params);
        xhr.open("POST", this.url + "/api/rest/post/" + arr.join("/"));
        xhr.withCredentials = true;
        xhr.send(params || "[]");
        xhr.onreadystatechange = function () {
            var data;
            if (xhr.readyState == 4) {
                data = parse(xhr.responseText);
                if (data.code == 0) {
                    success(data.data);
                } else {
                    fail && fail(data);
                }
            }
        };
    };
    return function ajaxInstance() {
        if (ins) {
            return ins;
        }
        ins = new Ajax(url);
        return ins;
    };
}