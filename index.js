(function (global, factory) {
    if (typeof window != "undefined") {
        if (typeof define == "function") {
            define(["js/services/service_factory.js"], function (service) {
                return factory.call(global, service);
            });
        } else {
            /** proudsmart手机端口应用入口 */
            window.createTracker = factory.call(global, global.common);
        }
    } else {
        console.log(typeof module.exports)
        if (module != null) {
            const pathLib = require("path");
            const services = require(pathLib.resolve(
                "./js/services/service_factory.js"
            ));
            module.exports = factory.call(global, services);
        }
    }
})(this, function (service) {
    var createAjax,
        isObject = isType("Object");
    if (typeof service.post == "function") {
        createAjax = function () {
            return service;
        };
    } else {
        createAjaxFn(service.origin);
    }

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

    function isType(type) {
        return function (target) {
            return {}.toString.call(target) == "[object " + type + "]";
        };
    }

    function bind(target, fn) {
        return function () {
            return fn.apply(target, arguments);
        };
    }

    function findValue(data, attr) {
        if (attr == null || data == null) {
            return;
        }
        var attrs = attr.split(new RegExp("\\\\|\\.", "g")),
            root = attrs.pop();

        function LoopItem(data, parents, path) {
            this.data = data;
            this.parents = parents || [];
            this.path = path || [];
        }
        LoopItem.prototype.hasParent = function (parent) {
            return this.parents.some(function (d) {
                return d == parent;
            });
        };
        var queue = [new LoopItem(data)],
            item;
        while ((item = queue.shift())) {
            var data = item.data,
                parents = item.parents,
                path = item.path;
            if (data.hasOwnProperty(root)) {
                if (attrs.length == 0 || attrs.join("/") === path.join("/")) {
                    return {
                        parents: parents,
                        value: data[root],
                        path: path.concat([root]).join("/")
                    };
                }
            }
            for (var i in data) {
                if (
                    data.hasOwnProperty(i) &&
                    isObject(data[i]) &&
                    !item.hasParent(data[i])
                ) {
                    queue.push(
                        new LoopItem(data[i], parents.concat([data]), path.concat([i]))
                    );
                }
            }
        }
        return;
    }

    function Time(time) {
        this.time = new Date(time);
    }
    Time.prototype.getMonthDate = function () {
        return this.time.getMonth() + 1 + "-" + this.time.getDate();
    };
    Time.prototype.getHourMin = function () {
        return this.time.getHours() + ":" + this.time.getMinutes();
    };

    function Template(taskList) {
        this.taskList = taskList;
        this.taskList.reverse();
    }
    Template.prototype.render = function () {
        return this.taskList.map(
            bind(this, function (task) {
                var dt = new Module(task.data);
                var render = task.render;
                return dt.decorate(
                    render.call(
                        dt,
                        bind(dt, function createAttr() {
                            return this.createAttr.apply(this, arguments);
                        }),
                        bind(dt, function findAttr() {
                            return this.findAttr.apply(this, arguments);
                        }),
                        bind(dt, function createTitle() {
                            return this.createTitle.apply(this, arguments);
                        }),
                        bind(dt, function createButton() {
                            return this.createButton.apply(this, arguments);
                        }),
                        bind(dt, function findValue() {
                            return this.findValue.apply(this, arguments);
                        }),
                        bind(dt, function createText() {
                            return this.createText.apply(this, arguments);
                        }),
                        bind(dt, function createDic() {
                            return this.createDic.apply(this, arguments);
                        }),
                        bind(dt, function createDicAttr() {
                            return this.createDicAttr.apply(this, arguments);
                        })
                    )
                );
            })
        );
    };

    function Module(data) {
        for (var i in data) {
            this[i] = data[i];
        }
    }
    Module.prototype.hasAttr = function (value) {
        return this.findValue(value) == null;
    };
    Module.prototype.isFirstTimeGenerated = function (value) {
        return true;
    };
    Module.prototype.createAttr = function (arr) {
        var name = arr[0],
            value = arr[1];
        var val = findValue(this, value);
        val = val == null ? "-" : val.value;
        return "<p>" + name + " " + val + "</p>";
    };
    Module.prototype.findAttr = function (arr) {
        var name = arr[0],
            value = arr[1];
        var val = findValue(this, value);
        val = val == null ? "-" : val.value;
        return "<p>" + name + " : " + val + "</p>";
    };
    Module.prototype.createTitle = function (title) {
        return "<div>" + title + "</div>";
    };
    Module.prototype.createButton = function (arr) {
        var name = arr[0],
            value = arr[1];
        return (
            '<button type="button" class="mui-btn mui-btn-primary"id="' +
            value +
            '">' +
            name +
            "</button>"
        );
    };
    Module.prototype.findValue = function (value) {
        value = findValue(this, value);
        value = value == null ? undefined : value.value;
        return value;
    };
    Module.prototype.createText = function (arr) {
        var name = arr[0],
            value = arr[1];
        return "<p>" + name + " " + value + "</p>";
    };
    Module.prototype.createDic = function (arr) {
        var name = arr[0],
            value = arr[1];
        return "<p>" + name + " " + findValue(this, value) + "</p>";
    };
    Module.prototype.createDicAttr = function (arr) {
        var name = arr[0],
            value = arr[1];
        return "<p>" + name + " " + findValue(this, value) + "</p>";
    };
    Module.prototype.getTaskJob = function () {
        var category = this.ticketTask.variables.ticket.category;
        if (new RegExp("310|320|330").test(category)) {
            return "计划实施";
        }
        return "综合处理";
    };
    Module.prototype.getAppSource = function () {
        var category = this.ticketTask.variables.ticket.category;
        if (new RegExp("310").test(category)) {
            return "智能检修";
        }
        if (new RegExp("320|340|290").test(category)) {
            return "智能决策";
        }
        return "状态维护标准";
    };
    Module.prototype.decorate = function (dt) {
        dt.reverse();
        var handlerName = this.ticketTask.handlerName;
        return dt
            .map(function (dt) {
                var time = new Time(dt.time);
                var arr = ['<div class="time">'];
                arr.push("<p>" + time.getMonthDate() + "</p>");
                arr.push("<p>" + time.getHourMin() + "</p>");
                arr.push("</div>");
                arr.push('<span class="mui-icon mui-icon-person first-state"></span>');
                arr.push(
                    '<span class="mui-pull-right origin-state">处理人：' +
                    handlerName +
                    "</span>"
                );
                arr.push(
                    '<span class=" origin-state" style="width:100px;margin-left:20px">' +
                    dt.title +
                    "</span>"
                );
                arr.push('<div class="line-progress">');
                arr = arr.concat(dt.data);
                arr.push("</div>");
                return arr;
            })
            .reduce(function (a, b) {
                return a.concat(b);
            }, []);
    };
    Module.prototype.createAlertAhead = function () {
        var rs = [],
            alertItemList = this.findValue("alertItemList"),
            onlineRuleId = this.findValue("onlineRuleId");
        if (alertItemList) {
            rs.push({
                title: "报警产生",
                icon: "fa fa-user fa-fw fa-circle-o bg-green",
                time: this.findValue("executeTime"),
                data: alertItemList
                    .map(
                        bind(this, function (d) {
                            return [
                                this.createDic(["报警级别", "alertSeverity", d.severity]),
                                this.createDic(["报警级别", "appName", d.appName]),
                                this.createText(["报警描述", d.alertTitle])
                            ];
                        })
                    )
                    .reduce(function (a, b) {
                        return a.concat(b);
                    }, [])
            });
        } else if (onlineRuleId) {
            var itemList = this.onlineRule.itemList;
            itemList = itemList.map(function (d) {
                return d.kpiThreshold;
            });
            rs.push({
                title: "报警产生",
                icon: "fa fa-user fa-fw fa-circle-o bg-green",
                time: this.findValue("executeTime"),
                data: itemList
                    .map(
                        bind(this, function (d) {
                            return [
                                this.createText(["报警类型", d.title]),
                                this.createDic(["报警级别", "alertSeverity", d.severity]),
                                this.createText(["报警来源", d.instanceName]),
                                this.createText(["报警描述", d.desc])
                            ];
                        })
                    )
                    .reduce(function (a, b) {
                        return a.concat(b);
                    }, [])
            });
        }
        return rs;
    };

    function createTracker(ticketNo, appFutureImpl) {
        function Tracker(ticketNo) {
            this.ticketNo = ticketNo;
            this.taskGetter = createTaskGetter(ticketNo);
        }
        Tracker.prototype.getTemplate = function (callback) {
            this.getAllTasks(function (taskList) {
                if (taskList == null) {
                    return callback.call();
                }
                var template = new Template(taskList);
                var str = template.render();
                callback(str);
            });
        };
        Tracker.prototype.getAllTasks = function (callback) {
            this.taskGetter.getAllTasks(callback);
        };
        return new Tracker(ticketNo);
    }

    function findValueFromList(list, condition, getter) {
        return list.reduce(function (a, b) {
            if (a) {
                return a;
            }
            return condition(b);
        }, undefined);
    }

    function createTaskGetter(ticketNo) {
        function TaskGetter(ticketNo) {
            this.ticketNo = ticketNo;
            this.ajax = createAjax();
            this.flowGetter = createFlowGetter(ticketNo);
        }
        TaskGetter.prototype.getByTicketNo = function (ticketNo, callback) {
            this.ajax.post(
                "ticketLogService.getByTicketNo",
                ticketNo,
                bind(this, function (ticketList) {
                    this.getFlowChart(ticketNo, function (flowChart) {
                        if (flowChart == null) {
                            return callback.call();
                        }
                        ticketList = ticketList
                            .map(function (ticket) {
                                var taskConfigName =
                                    ticket.ticketTask && ticket.ticketTask.taskConfigName,
                                    fd;
                                if (taskConfigName) {
                                    fd = flowChart.find(function (flow) {
                                        return flow.content == taskConfigName;
                                    });
                                    if (fd) {
                                        fd.data = ticket;
                                        return fd;
                                    }
                                }
                                return;
                            })
                            .filter(function (d) {
                                return d;
                            });
                        callback(ticketList);
                    });
                })
            );
        };
        TaskGetter.prototype.getFlowChart = function (ticketNo, callback) {
            this.flowGetter.getFlowChart(ticketNo, callback);
        };
        TaskGetter.prototype.getAllTasks = function (callback) {
            /** 目前只支持一个源头调用合并的情况 */
            this.getByTicketNo(
                ticketNo,
                bind(this, function (ticketList) {
                    if (ticketList == null) {
                        return callback.call();
                    }
                    var sourceTicketNo = findValueFromList(
                        ticketList.map(function (t) {
                            return t.data;
                        }),
                        function condition(item) {
                            var val = findValue(item, "sourceTicketNo");
                            return val && val.value;
                        }
                    );
                    if (sourceTicketNo) {
                        this.getByTicketNo(sourceTicketNo, function (list) {
                            list = list || [];
                            callback(list.concat(ticketList));
                        });
                    } else {
                        callback(ticketList);
                    }
                })
            );
        };
        return new TaskGetter(ticketNo);
    }

    function runBySequence(queue, callback, param) {
        function runSeq(inx, param) {
            if (inx < queue.length) {
                fn = queue[inx];
                fn &&
                    fn.call(
                        undefined,
                        param,
                        function (val) {
                            runSeq(inx + 1, val);
                        },
                        function (e) {
                            console.error(e);
                            callback();
                        }
                    );
            } else {
                callback(param);
            }
        }
        runSeq(0, param);
    }

    function createFlowGetter(ticketNo) {
        function FlowGetter(ticketNo) {
            this.ticketNo = ticketNo;
            this.ajax = createAjax();
        }
        FlowGetter.prototype.getFlowChart = function (ticketNo, callback) {
            runBySequence(
                [
                    bind(this, function (ticketNo, next, error) {
                        this.ajax.post(
                            "ticketTaskService.getTicket",
                            ticketNo,
                            function success(d) {
                                if (d == null) {
                                    error(
                                        "工单号[" + ticketNo + "]没对应的工单数据，可能已被删除。"
                                    );
                                }
                                var ticketCategoryId = d.ticketCategoryId;
                                next(ticketCategoryId);
                            }
                        );
                    }),
                    bind(this, function (ticketCategoryId, next, error) {
                        this.ajax.post(
                            "ticketCategoryService.getTicketCategoryById",
                            ticketCategoryId,
                            function success(d) {
                                if (d == null) {
                                    error(
                                        "工单种类号[" +
                                        ticketCategoryId +
                                        "]没对应的类型数据，可能已被删除。"
                                    );
                                }
                                var workflowId = d.workflowId;
                                next(workflowId);
                            }
                        );
                    }),
                    bind(this, function (workflowId, next) {
                        this.ajax.post(
                            "workflowService.getWorkflowById",
                            workflowId,
                            function success(d) {
                                if (d == null) {
                                    error(
                                        "流程号[" + workflowId + "]没对应的流程数据，可能已被删除。"
                                    );
                                }
                                var name = d.name;
                                next(name);
                            }
                        );
                    })
                ],
                bind(this, function (flowName) {
                    if (flowName == null) {
                        return callback && callback.call();
                    }
                    this.ajax.post(
                        "workflowDefinitionService.getWorkflowDefinitions",
                        function success(flows) {
                            var flow = flows.find(function (flow) {
                                    return flow.name == flowName;
                                }),
                                viewContent;
                            if (flow) {
                                viewContent = parse(flow.viewContent);
                                callback(
                                    viewContent &&
                                    viewContent.cells
                                    .filter(function (cell) {
                                        return (
                                            cell.type == "bpmn.Activity" &&
                                            cell.dataExtractExpression
                                        );
                                    })
                                    .map(function (cell) {
                                        return {
                                            content: cell.content,
                                            render: eval("(" + cell.dataExtractExpression + ")")
                                        };
                                    })
                                );
                            } else {
                                callback();
                            }
                        }
                    );
                }),
                ticketNo
            );
        };
        return new FlowGetter(ticketNo);
    }

    function createAjaxFn(url) {
        var ins;

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
    return createTracker;
});