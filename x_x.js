// ==UserScript==
// @name        DEADCAT
// @namespace   Script
// @match       https://www.google.com/
// @grant       none
// @version     1.0
// @author      -
// @description 8/13/2023, 10:51:41 AM
// ==/UserScript==


let x_x = function (query) {
    if (typeof (query) == 'string') {
        let element = document.querySelector(query);
        return x_x.wrap(element);
    }
    return x_x.wrap(element);
};

x_x.wrap = function (element) {
    return new x_x.typesets.X_Element(element);
};

x_x.unwrap = function (xelement) {
    if (xelement == undefined) { return undefined; }
    if (typeof (xelement) == "X_Element") {
        return xelement.get();
    }

    return xelement;
};

x_x.null_default = function (original, def) {
    if (Array.isArray(original)) {
        if (original.length != 0) {

            let deeper = true;
            let index = 1;
            let current = original[0];

            while (index < original.length) {
                current = current[original[index++]];
                if (current == undefined) {
                    deeper = false;
                    break;
                }
            }
            if (deeper) { return current; }

        }

    } else if (original != undefined) {
        return original;
    }

    if (def == undefined) { return undefined; }

    if (typeof (def) == 'function') {
        return def();
    }

    return def;
};

x_x.search_variable = function (victim, var_name) {
    if (victim[var_name] == undefined) {
        for (let key of Object.keys(victim)) {
            let search_inner = x_x.search_variable(victim[key], var_name);
            if (search_inner != undefined) {
                return search_inner;
            }
        }
    }
    return victim[var_name];
};

x_x.each = function (victim, task) {
    if (Array.isArray(victim)) {
        for (let element of victim) {
            task(element);
        }
        return true;
    } else if (typeof (victim) == 'object') {
        for (let element of Object.keys(victim)) {
            task(victim[element]);
        }
    }
    return false;
};

x_x.map = function (victim, factory, callback = true) {

    /* initialize a new array */
    let new_array = [];
    if (Array.isArray(victim)) {
        for (const value of victim) {
            new_array.push(callback ? x_x.map(value, factory) : factory(value));
        }
        return new_array;
    } else if (typeof(victim) == 'object') {
        for (const value of Object.keys(victim)) {
            let new_inside_array = [];
            new_inside_array.push(x_x.map(victim[value], factory));
            new_array.push(new_inside_array);
        }
        return new_array;
    }

    if (victim != undefined) {
        return factory(victim);
    }
};

x_x.ifnnull = function(victim, func) {
    if (victim != undefined) {
        func(victim);
        return true;
    }
    return false;
}

x_x.ifnull = function(victim, func) {
    if (victim == undefined) {
        func();
        return true;
    }
    return false;
}

x_x.create_element = function(tag, html_code, options) {
    let element = document.createElement(tag);
    element.innerHTML = html_code;

    if (options != undefined) {
        x_x.ifnnull(options.id, (e) => { element.id = e; });
        x_x.ifnnull(options.style, (e) => { element.style = e; });
        x_x.ifnnull(options.className, (e) => { element.className = e; });
        x_x.ifnnull(options.parent, (e) => {
            let parent = e;
            if (typeof(parent) == 'string') {
                parent = x_x(options.parent).get();
            }
            if (parent != undefined) {
                parent.appendChild(element);
            }
        });
    }
    
    return element;
};

x_x.simulate = function (_victim, type, parameters) {
    const victim = x_x.unwrap(victim);
    if (victim != undefined) {
        switch (type) {
            case "mouse": {
                const _button = x_x.null_default([parameters, "button"], 0);
                const mouseDownEvent = new MouseEvent('mousedown', {
                    bubbles: true,
                    cancelable: true,
                    view: window,
                    button: _button
                });

                const mouseUpEvent = new MouseEvent('mouseup', {
                    bubbles: true,
                    cancelable: true,
                    view: window,
                    button: _button
                });

                const clickEvent = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window,
                    button: _button
                });

                // Dispatch the events in the desired sequence
                elementToInteract.dispatchEvent(mouseDownEvent);
                elementToInteract.dispatchEvent(mouseUpEvent);
                elementToInteract.dispatchEvent(clickEvent);
                break;
            }
            case "mousemove": {
                const x = x_x.null_default([parameters, "x"]);
                const y = x_x.null_default([parameters, "y"]);
                const mouseMoveEvent = new MouseEvent('mousemove', {
                    bubbles: true,
                    cancelable: true,
                    view: window,
                    clientX: x,
                    clientY: y
                });

                // Dispatch the mousemove event on the element  
                victim.dispatchEvent(mouseMoveEvent);
            }
        }
    }
};

x_x.if_exists = function (query, task) {
    let element = document.querySelector(query);
    if (element != undefined) {
        task(element);
        return true;
    }
    return false;
}


x_x.on_exists = function (query, on, interval, retries = 0, once = true) {
    if (document.querySelector(query) != undefined) {
        on(element);
        return;
    }

    let try_count = 0;
    let timer = setInterval(function () {
        let elements = document.querySelectorAll(query);
        for (let element of elements) {
            on(element);
        }

        if (once) {
            clearInterval(timer);
        }

        if (retries != 0 && !once) {
            try_count++;
            if (try_count >= retries) {
                clearInterval(timer);
                return;
            }
        }

    }, interval);
};

x_x.repeat = function(func, times, interval = 1000) {
    let repeat_times = times;
    let timer_id = setInterval(function() {
        func();
        if (repeat_times-- <= 0) {
            clearInterval(timer_id);
        }
    }, interval);
};

x_x.filter = function(victim, check) {
    if (Array.isArray(victim)) {
        let array = [];
        for (const value of victim) {
            if (check(value)) {
                array.push(x_x.filter(value, check));
            }
        }
        if (array.length > 0) {
            return array;
        }
    } else if (typeof(victim) == 'object') {
        let instance = {};
        for (const key of Object.keys(victim)) {
            const value = victim[key];
            if (check(value)) {
                instance[key] = x_x.filter(value, check);
            }
        }
        return instance;
    }

    return check(victim) ? victim : null;
        
}

x_x.config_get = function (name, defvalue) {
    if (window == undefined || window.localStorage == undefined) {
        return defvalue;
    }
    let value = JSON.parse(window.localStorage.getItem(name));
    return value == undefined ? defvalue : value;
}

x_x.config_set = function (name, value) {
    if (window == undefined || window.localStorage == undefined) {
        return undefined;
    }
    window.localStorage.setItem(name, JSON.stringify(value));
    return value;
}

/* classes */


x_x.typesets = {

    X_Element: class {

        constructor(element) {
            this.element = element;
        }

        remove() {
            this.element.remove();
        }

        hide() {
            this.element.hide();
        }

        get() {
            return this.element;
        }

    }


};

x_x.NULL_ELEMENT = new x_x.typesets.X_Element(undefined);

window.x_x = x_x;
