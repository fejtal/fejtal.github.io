
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.48.0' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    let pageTypeHome = "home"; // will make a functionality so it's dynamic

    let user = writable({
      email: "",
      pageType: pageTypeHome
    });

    /* src\components\Utility\PageType.svelte generated by Svelte v3.48.0 */

    const { console: console_1$2 } = globals;

    function create_fragment$c(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('PageType', slots, []);

    	function collect_data() {
    		let data = { "pageType": pageTypeHome };
    		console.log('pageType', data);
    	}

    	collect_data();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$2.warn(`<PageType> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ pageTypeHome, collect_data });
    	return [];
    }

    class PageType extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PageType",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src\components\Dropdowns\MiniCart.svelte generated by Svelte v3.48.0 */

    const file$b = "src\\components\\Dropdowns\\MiniCart.svelte";

    function create_fragment$b(ctx) {
    	let div5;
    	let div4;
    	let label;
    	let div0;
    	let svg;
    	let path;
    	let t0;
    	let span0;
    	let t2;
    	let div3;
    	let div2;
    	let span1;
    	let t4;
    	let span2;
    	let t6;
    	let div1;
    	let button;

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div4 = element("div");
    			label = element("label");
    			div0 = element("div");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			t0 = space();
    			span0 = element("span");
    			span0.textContent = "8";
    			t2 = space();
    			div3 = element("div");
    			div2 = element("div");
    			span1 = element("span");
    			span1.textContent = "8 Items";
    			t4 = space();
    			span2 = element("span");
    			span2.textContent = "Subtotal: $999";
    			t6 = space();
    			div1 = element("div");
    			button = element("button");
    			button.textContent = "View cart";
    			attr_dev(path, "stroke-linecap", "round");
    			attr_dev(path, "stroke-linejoin", "round");
    			attr_dev(path, "stroke-width", "2");
    			attr_dev(path, "d", "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z");
    			add_location(path, file$b, 4, 120, 291);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "class", "h-5 w-5");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "stroke", "currentColor");
    			add_location(svg, file$b, 4, 10, 181);
    			attr_dev(span0, "class", "badge badge-sm indicator-item");
    			add_location(span0, file$b, 5, 10, 534);
    			attr_dev(div0, "class", "indicator");
    			add_location(div0, file$b, 3, 8, 146);
    			attr_dev(label, "for", "form");
    			attr_dev(label, "tabindex", "0");
    			attr_dev(label, "class", "btn btn-ghost btn-circle");
    			add_location(label, file$b, 2, 6, 72);
    			attr_dev(span1, "class", "font-bold text-lg");
    			add_location(span1, file$b, 10, 10, 758);
    			attr_dev(span2, "class", "text-info");
    			add_location(span2, file$b, 11, 10, 816);
    			attr_dev(button, "class", "btn btn-primary btn-block");
    			add_location(button, file$b, 13, 12, 913);
    			attr_dev(div1, "class", "card-actions");
    			add_location(div1, file$b, 12, 10, 873);
    			attr_dev(div2, "class", "card-body");
    			add_location(div2, file$b, 9, 8, 723);
    			attr_dev(div3, "tabindex", "0");
    			attr_dev(div3, "class", "mt-3 card card-compact dropdown-content w-52 bg-white shadow");
    			add_location(div3, file$b, 8, 6, 626);
    			attr_dev(div4, "class", "dropdown dropdown-end");
    			add_location(div4, file$b, 1, 4, 29);
    			attr_dev(div5, "class", "flex-none");
    			add_location(div5, file$b, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div4);
    			append_dev(div4, label);
    			append_dev(label, div0);
    			append_dev(div0, svg);
    			append_dev(svg, path);
    			append_dev(div0, t0);
    			append_dev(div0, span0);
    			append_dev(div4, t2);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, span1);
    			append_dev(div2, t4);
    			append_dev(div2, span2);
    			append_dev(div2, t6);
    			append_dev(div2, div1);
    			append_dev(div1, button);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('MiniCart', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<MiniCart> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class MiniCart extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MiniCart",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src\components\Dropdowns\UserDropdown.svelte generated by Svelte v3.48.0 */

    const file$a = "src\\components\\Dropdowns\\UserDropdown.svelte";

    function create_fragment$a(ctx) {
    	let div1;
    	let label;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let ul;
    	let li0;
    	let a0;
    	let t1;
    	let span;
    	let t3;
    	let li1;
    	let a1;
    	let t5;
    	let li2;
    	let a2;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			label = element("label");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			ul = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			t1 = text("Profile\r\n          ");
    			span = element("span");
    			span.textContent = "New";
    			t3 = space();
    			li1 = element("li");
    			a1 = element("a");
    			a1.textContent = "Settings";
    			t5 = space();
    			li2 = element("li");
    			a2 = element("a");
    			a2.textContent = "Logout";
    			if (!src_url_equal(img.src, img_src_value = "https://api.lorem.space/image/face?hash=33791")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "alt");
    			add_location(img, file$a, 3, 8, 161);
    			attr_dev(div0, "class", "w-10 rounded-full");
    			add_location(div0, file$a, 2, 6, 120);
    			attr_dev(label, "for", "form");
    			attr_dev(label, "tabindex", "0");
    			attr_dev(label, "class", "btn btn-ghost btn-circle avatar");
    			add_location(label, file$a, 1, 4, 41);
    			attr_dev(span, "class", "badge");
    			add_location(span, file$a, 10, 10, 472);
    			attr_dev(a0, "href", "https://google.com");
    			attr_dev(a0, "class", "justify-between");
    			add_location(a0, file$a, 8, 8, 388);
    			add_location(li0, file$a, 7, 6, 374);
    			attr_dev(a1, "href", "https://google.com");
    			add_location(a1, file$a, 13, 10, 541);
    			add_location(li1, file$a, 13, 6, 537);
    			attr_dev(a2, "href", "https://google.com");
    			add_location(a2, file$a, 14, 10, 599);
    			add_location(li2, file$a, 14, 6, 595);
    			attr_dev(ul, "tabindex", "0");
    			attr_dev(ul, "class", "menu menu-compact dropdown-content mt-3 p-2 shadow bg-white rounded-box w-52");
    			add_location(ul, file$a, 6, 4, 264);
    			attr_dev(div1, "class", "dropdown dropdown-end");
    			add_location(div1, file$a, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, label);
    			append_dev(label, div0);
    			append_dev(div0, img);
    			append_dev(div1, t0);
    			append_dev(div1, ul);
    			append_dev(ul, li0);
    			append_dev(li0, a0);
    			append_dev(a0, t1);
    			append_dev(a0, span);
    			append_dev(ul, t3);
    			append_dev(ul, li1);
    			append_dev(li1, a1);
    			append_dev(ul, t5);
    			append_dev(ul, li2);
    			append_dev(li2, a2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('UserDropdown', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<UserDropdown> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class UserDropdown extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "UserDropdown",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src\components\Navbars\Navbar.svelte generated by Svelte v3.48.0 */
    const file$9 = "src\\components\\Navbars\\Navbar.svelte";

    function create_fragment$9(ctx) {
    	let div4;
    	let div1;
    	let div0;
    	let label;
    	let svg0;
    	let path0;
    	let t0;
    	let ul1;
    	let li0;
    	let a0;
    	let t2;
    	let li3;
    	let a1;
    	let t3;
    	let svg1;
    	let path1;
    	let t4;
    	let ul0;
    	let li1;
    	let a2;
    	let t6;
    	let li2;
    	let a3;
    	let t8;
    	let li4;
    	let a4;
    	let t10;
    	let a5;
    	let t12;
    	let div2;
    	let ul3;
    	let li5;
    	let a6;
    	let t14;
    	let li8;
    	let a7;
    	let t15;
    	let svg2;
    	let path2;
    	let t16;
    	let ul2;
    	let li6;
    	let a8;
    	let t18;
    	let li7;
    	let a9;
    	let t20;
    	let li9;
    	let a10;
    	let t22;
    	let div3;
    	let minicart;
    	let t23;
    	let userdropdown;
    	let current;
    	minicart = new MiniCart({ $$inline: true });
    	userdropdown = new UserDropdown({ $$inline: true });

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			label = element("label");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			t0 = space();
    			ul1 = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			a0.textContent = "Item 1";
    			t2 = space();
    			li3 = element("li");
    			a1 = element("a");
    			t3 = text("Parent\r\n            ");
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			t4 = space();
    			ul0 = element("ul");
    			li1 = element("li");
    			a2 = element("a");
    			a2.textContent = "Submenu 1";
    			t6 = space();
    			li2 = element("li");
    			a3 = element("a");
    			a3.textContent = "Submenu 2";
    			t8 = space();
    			li4 = element("li");
    			a4 = element("a");
    			a4.textContent = "Item 3";
    			t10 = space();
    			a5 = element("a");
    			a5.textContent = "TEST";
    			t12 = space();
    			div2 = element("div");
    			ul3 = element("ul");
    			li5 = element("li");
    			a6 = element("a");
    			a6.textContent = "Item 1";
    			t14 = space();
    			li8 = element("li");
    			a7 = element("a");
    			t15 = text("Item 2\r\n          ");
    			svg2 = svg_element("svg");
    			path2 = svg_element("path");
    			t16 = space();
    			ul2 = element("ul");
    			li6 = element("li");
    			a8 = element("a");
    			a8.textContent = "Submenu 1";
    			t18 = space();
    			li7 = element("li");
    			a9 = element("a");
    			a9.textContent = "Submenu 2";
    			t20 = space();
    			li9 = element("li");
    			a10 = element("a");
    			a10.textContent = "Item 3";
    			t22 = space();
    			div3 = element("div");
    			create_component(minicart.$$.fragment);
    			t23 = space();
    			create_component(userdropdown.$$.fragment);
    			attr_dev(path0, "stroke-linecap", "round");
    			attr_dev(path0, "stroke-linejoin", "round");
    			attr_dev(path0, "stroke-width", "2");
    			attr_dev(path0, "d", "M4 6h16M4 12h8m-8 6h16");
    			add_location(path0, file$9, 9, 118, 430);
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "class", "h-5 w-5");
    			attr_dev(svg0, "fill", "none");
    			attr_dev(svg0, "viewBox", "0 0 24 24");
    			attr_dev(svg0, "stroke", "currentColor");
    			add_location(svg0, file$9, 9, 8, 320);
    			attr_dev(label, "for", "navbar");
    			attr_dev(label, "tabindex", "0");
    			attr_dev(label, "class", "btn btn-ghost lg:hidden");
    			add_location(label, file$9, 8, 6, 245);
    			attr_dev(a0, "href", "wikipedia.org");
    			add_location(a0, file$9, 12, 12, 678);
    			add_location(li0, file$9, 12, 8, 674);
    			attr_dev(path1, "d", "M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z");
    			add_location(path1, file$9, 16, 116, 944);
    			attr_dev(svg1, "class", "fill-current");
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "width", "24");
    			attr_dev(svg1, "height", "24");
    			attr_dev(svg1, "viewBox", "0 0 24 24");
    			add_location(svg1, file$9, 16, 12, 840);
    			attr_dev(a1, "href", "wikipedia.org");
    			attr_dev(a1, "class", "justify-between");
    			add_location(a1, file$9, 14, 10, 757);
    			attr_dev(a2, "href", "wikipedia.org");
    			add_location(a2, file$9, 19, 16, 1140);
    			add_location(li1, file$9, 19, 12, 1136);
    			attr_dev(a3, "href", "wikipedia.org");
    			add_location(a3, file$9, 20, 16, 1201);
    			add_location(li2, file$9, 20, 12, 1197);
    			attr_dev(ul0, "class", "mt-3 card card-compact dropdown-content w-52 bg-white shadow");
    			add_location(ul0, file$9, 18, 10, 1049);
    			attr_dev(li3, "tabindex", "0");
    			add_location(li3, file$9, 13, 8, 728);
    			attr_dev(a4, "href", "wikipedia.org");
    			add_location(a4, file$9, 23, 12, 1290);
    			add_location(li4, file$9, 23, 8, 1286);
    			attr_dev(ul1, "tabindex", "0");
    			attr_dev(ul1, "class", "menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52");
    			add_location(ul1, file$9, 11, 6, 559);
    			attr_dev(div0, "class", "dropdown");
    			add_location(div0, file$9, 7, 4, 215);
    			attr_dev(a5, "href", "wikipedia.org");
    			attr_dev(a5, "class", "btn btn-ghost normal-case text-xl");
    			add_location(a5, file$9, 26, 4, 1361);
    			attr_dev(div1, "class", "navbar-start");
    			add_location(div1, file$9, 6, 2, 183);
    			attr_dev(a6, "href", "wikipedia.org");
    			add_location(a6, file$9, 30, 10, 1547);
    			add_location(li5, file$9, 30, 6, 1543);
    			attr_dev(path2, "d", "M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z");
    			add_location(path2, file$9, 34, 114, 1781);
    			attr_dev(svg2, "class", "fill-current");
    			attr_dev(svg2, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg2, "width", "20");
    			attr_dev(svg2, "height", "20");
    			attr_dev(svg2, "viewBox", "0 0 24 24");
    			add_location(svg2, file$9, 34, 10, 1677);
    			attr_dev(a7, "href", "wikipedia.org");
    			add_location(a7, file$9, 32, 8, 1622);
    			attr_dev(a8, "href", "wikipedia.org");
    			add_location(a8, file$9, 37, 14, 1913);
    			add_location(li6, file$9, 37, 10, 1909);
    			attr_dev(a9, "href", "wikipedia.org");
    			add_location(a9, file$9, 38, 14, 1972);
    			add_location(li7, file$9, 38, 10, 1968);
    			attr_dev(ul2, "class", "p-2");
    			add_location(ul2, file$9, 36, 8, 1881);
    			attr_dev(li8, "tabindex", "0");
    			add_location(li8, file$9, 31, 6, 1595);
    			attr_dev(a10, "href", "wikipedia.org");
    			add_location(a10, file$9, 41, 10, 2055);
    			add_location(li9, file$9, 41, 6, 2051);
    			attr_dev(ul3, "class", "menu menu-horizontal p-0");
    			add_location(ul3, file$9, 29, 4, 1498);
    			attr_dev(div2, "class", "navbar-center hidden lg:flex");
    			add_location(div2, file$9, 28, 2, 1450);
    			attr_dev(div3, "class", "navbar-end");
    			add_location(div3, file$9, 44, 2, 2120);
    			attr_dev(div4, "class", "navbar rounded-md bg-white");
    			add_location(div4, file$9, 5, 0, 139);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div1);
    			append_dev(div1, div0);
    			append_dev(div0, label);
    			append_dev(label, svg0);
    			append_dev(svg0, path0);
    			append_dev(div0, t0);
    			append_dev(div0, ul1);
    			append_dev(ul1, li0);
    			append_dev(li0, a0);
    			append_dev(ul1, t2);
    			append_dev(ul1, li3);
    			append_dev(li3, a1);
    			append_dev(a1, t3);
    			append_dev(a1, svg1);
    			append_dev(svg1, path1);
    			append_dev(li3, t4);
    			append_dev(li3, ul0);
    			append_dev(ul0, li1);
    			append_dev(li1, a2);
    			append_dev(ul0, t6);
    			append_dev(ul0, li2);
    			append_dev(li2, a3);
    			append_dev(ul1, t8);
    			append_dev(ul1, li4);
    			append_dev(li4, a4);
    			append_dev(div1, t10);
    			append_dev(div1, a5);
    			append_dev(div4, t12);
    			append_dev(div4, div2);
    			append_dev(div2, ul3);
    			append_dev(ul3, li5);
    			append_dev(li5, a6);
    			append_dev(ul3, t14);
    			append_dev(ul3, li8);
    			append_dev(li8, a7);
    			append_dev(a7, t15);
    			append_dev(a7, svg2);
    			append_dev(svg2, path2);
    			append_dev(li8, t16);
    			append_dev(li8, ul2);
    			append_dev(ul2, li6);
    			append_dev(li6, a8);
    			append_dev(ul2, t18);
    			append_dev(ul2, li7);
    			append_dev(li7, a9);
    			append_dev(ul3, t20);
    			append_dev(ul3, li9);
    			append_dev(li9, a10);
    			append_dev(div4, t22);
    			append_dev(div4, div3);
    			mount_component(minicart, div3, null);
    			append_dev(div3, t23);
    			mount_component(userdropdown, div3, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(minicart.$$.fragment, local);
    			transition_in(userdropdown.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(minicart.$$.fragment, local);
    			transition_out(userdropdown.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			destroy_component(minicart);
    			destroy_component(userdropdown);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Navbar', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Navbar> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ MiniCart, UserDropdown });
    	return [];
    }

    class Navbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navbar",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src\components\Breadcrumb\Breadcrumb.svelte generated by Svelte v3.48.0 */

    const file$8 = "src\\components\\Breadcrumb\\Breadcrumb.svelte";

    function create_fragment$8(ctx) {
    	let div;
    	let ul;
    	let li0;
    	let a0;
    	let t1;
    	let li1;
    	let a1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			ul = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			a0.textContent = "Home";
    			t1 = space();
    			li1 = element("li");
    			a1 = element("a");
    			a1.textContent = "Newsletter";
    			attr_dev(a0, "href", "https://google.com");
    			add_location(a0, file$8, 2, 10, 60);
    			add_location(li0, file$8, 2, 6, 56);
    			attr_dev(a1, "href", "https://google.com");
    			add_location(a1, file$8, 3, 10, 115);
    			add_location(li1, file$8, 3, 6, 111);
    			add_location(ul, file$8, 1, 4, 44);
    			attr_dev(div, "class", "text-sm breadcrumbs px-2");
    			add_location(div, file$8, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, ul);
    			append_dev(ul, li0);
    			append_dev(li0, a0);
    			append_dev(ul, t1);
    			append_dev(ul, li1);
    			append_dev(li1, a1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Breadcrumb', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Breadcrumb> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Breadcrumb extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Breadcrumb",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src\components\Buttons\Submitform.svelte generated by Svelte v3.48.0 */

    const { console: console_1$1 } = globals;
    const file$7 = "src\\components\\Buttons\\Submitform.svelte";

    function create_fragment$7(ctx) {
    	let div;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			button.textContent = "Sign up";
    			attr_dev(button, "id", "submit-btn");
    			attr_dev(button, "class", "btn btn-primary");
    			add_location(button, file$7, 8, 4, 178);
    			attr_dev(div, "class", "form-control mt-6");
    			add_location(div, file$7, 7, 0, 141);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*console_output*/ ctx[0], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let $user;
    	validate_store(user, 'user');
    	component_subscribe($$self, user, $$value => $$invalidate(1, $user = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Submitform', slots, []);

    	function console_output() {
    		return console.log("signup", $user);
    	}
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<Submitform> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ user, console_output, $user });
    	return [console_output];
    }

    class Submitform extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Submitform",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src\components\Form\Form.svelte generated by Svelte v3.48.0 */
    const file$6 = "src\\components\\Form\\Form.svelte";

    function create_fragment$6(ctx) {
    	let div5;
    	let div4;
    	let div0;
    	let h1;
    	let t1;
    	let p;
    	let t3;
    	let div3;
    	let div2;
    	let div1;
    	let label;
    	let span;
    	let t5;
    	let input;
    	let t6;
    	let submitform;
    	let current;
    	let mounted;
    	let dispose;
    	submitform = new Submitform({ $$inline: true });

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div4 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Stay with us!";
    			t1 = space();
    			p = element("p");
    			p.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed et blandit mi. Maecenas fringilla eros eget augue tincidunt feugiat. Donec sit amet auctor nisl. Maecenas varius, felis quis volutpat luctus, enim erat vulputate diam, eget hendrerit magna arcu ac est. Donec scelerisque nisi nec massa euismod lobortis.";
    			t3 = space();
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			label = element("label");
    			span = element("span");
    			span.textContent = "Email";
    			t5 = space();
    			input = element("input");
    			t6 = space();
    			create_component(submitform.$$.fragment);
    			attr_dev(h1, "class", "text-5xl font-bold");
    			add_location(h1, file$6, 8, 8, 273);
    			attr_dev(p, "class", "py-6");
    			add_location(p, file$6, 9, 8, 333);
    			attr_dev(div0, "class", "text-center lg:text-left");
    			add_location(div0, file$6, 7, 6, 224);
    			attr_dev(span, "class", "label-text");
    			add_location(span, file$6, 15, 14, 892);
    			attr_dev(label, "for", "form");
    			attr_dev(label, "class", "label");
    			add_location(label, file$6, 14, 12, 844);
    			attr_dev(input, "id", "email-form");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "email");
    			attr_dev(input, "class", "input input-bordered");
    			add_location(input, file$6, 17, 12, 965);
    			attr_dev(div1, "class", "form-control");
    			add_location(div1, file$6, 13, 10, 804);
    			attr_dev(div2, "class", "card-body");
    			add_location(div2, file$6, 12, 8, 769);
    			attr_dev(div3, "class", "card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100");
    			add_location(div3, file$6, 11, 6, 688);
    			attr_dev(div4, "class", "hero-content flex-col lg:flex-row-reverse");
    			add_location(div4, file$6, 6, 4, 161);
    			attr_dev(div5, "class", "hero h-[32rem] bg-white");
    			add_location(div5, file$6, 5, 0, 118);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div4);
    			append_dev(div4, div0);
    			append_dev(div0, h1);
    			append_dev(div0, t1);
    			append_dev(div0, p);
    			append_dev(div4, t3);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, label);
    			append_dev(label, span);
    			append_dev(div1, t5);
    			append_dev(div1, input);
    			set_input_value(input, /*$user*/ ctx[0].email);
    			append_dev(div2, t6);
    			mount_component(submitform, div2, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[1]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$user*/ 1 && input.value !== /*$user*/ ctx[0].email) {
    				set_input_value(input, /*$user*/ ctx[0].email);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(submitform.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(submitform.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			destroy_component(submitform);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let $user;
    	validate_store(user, 'user');
    	component_subscribe($$self, user, $$value => $$invalidate(0, $user = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Form', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Form> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		$user.email = this.value;
    		user.set($user);
    	}

    	$$self.$capture_state = () => ({ user, Submitform, $user });
    	return [$user, input_input_handler];
    }

    class Form extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Form",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    var product_1 = {
    	id: "prod001",
    	"attribute:name": "Glasses",
    	"attribute:archived": "FALSE",
    	"attribute:url": "http://www.sample.com/products/product001",
    	"attribute:imageUrl": "http://www.sample.com/image/product001.jpg",
    	"attribute:price": "100.12",
    	"attribute:listPrice": "100.12",
    	"attribute:inventoryCount": "1",
    	"attribute:description": "Glasses made to block blinding light",
    	"attribute:currency": "USD",
    	"attribute:formattedPrice": "Now $100.12",
    	"dimension:SaleStatus": "OnSale",
    	"dimension:Gender": "Men",
    	categories: "Clothing|Outerwear",
    	skus: "sku1000|sku1001|sku1002",
    	"location:latitude": "47.97522",
    	"location:longitude": "113.62209",
    	"location:city": "",
    	"location:state": ""
    };
    var product_2 = {
    	id: "prod002",
    	"attribute:name": "Jacket",
    	"attribute:archived": "FALSE",
    	"attribute:url": "http://www.sample.com/products/product002",
    	"attribute:imageUrl": "http://www.sample.com/image/product002.jpg",
    	"attribute:price": "54.63",
    	"attribute:listPrice": "59",
    	"attribute:inventoryCount": "1",
    	"attribute:description": "A black leather jacket",
    	"attribute:currency": "USD",
    	"attribute:formattedPrice": "",
    	"dimension:SaleStatus": "OnSale",
    	"dimension:Gender": "Men|Women|Unisex",
    	categories: "Clothing|Outerwear|Leather",
    	skus: "",
    	"location:latitude": "29.05123",
    	"location:longitude": "31.20870",
    	"location:city": "",
    	"location:state": ""
    };
    var product_3 = {
    	id: "prod003",
    	"attribute:name": "Shirt",
    	"attribute:archived": "FALSE",
    	"attribute:url": "http://www.sample.com/products/product003",
    	"attribute:imageUrl": "http://www.sample.com/image/product003.jpg",
    	"attribute:price": "10",
    	"attribute:listPrice": "",
    	"attribute:inventoryCount": "1",
    	"attribute:description": "A blue polo shirt",
    	"attribute:currency": "AUD",
    	"attribute:formattedPrice": "Now $10",
    	"dimension:SaleStatus": "",
    	"dimension:Gender": "Unisex",
    	categories: "Clothing|Shirt",
    	skus: "sku2000|sku2002|sku2004",
    	"location:latitude": "-14.63321",
    	"location:longitude": "14.32845",
    	"location:city": "",
    	"location:state": ""
    };
    var product_4 = {
    	id: "prod003",
    	"attribute:name": "Shorts",
    	"attribute:archived": "FALSE",
    	"attribute:url": "http://www.sample.com/products/product004",
    	"attribute:imageUrl": "http://www.sample.com/image/product004.jpg",
    	"attribute:price": "33",
    	"attribute:listPrice": "60",
    	"attribute:inventoryCount": "1",
    	"attribute:description": "Beige khaki shorts",
    	"attribute:currency": "EUR",
    	"attribute:formattedPrice": "Now â‚¬33",
    	"dimension:SaleStatus": "OnSale",
    	"dimension:Gender": "Men",
    	categories: "Clothing|Pants|Shorts",
    	skus: "sku300|sku301|sku302|sku399",
    	"location:latitude": "-19.63486",
    	"location:longitude": "142.05087",
    	"location:city": "",
    	"location:state": ""
    };
    var product_5 = {
    	id: "prod004",
    	"attribute:name": "Pants",
    	"attribute:archived": "FALSE",
    	"attribute:url": "http://www.sample.com/products/product005",
    	"attribute:imageUrl": "http://www.sample.com/image/product005.jpg",
    	"attribute:price": "99.98",
    	"attribute:listPrice": "120",
    	"attribute:inventoryCount": "0",
    	"attribute:description": "Blue jeans",
    	"attribute:currency": "USD",
    	"attribute:formattedPrice": "Now $99.98",
    	"dimension:SaleStatus": "ClosingSale",
    	"dimension:Gender": "Men",
    	categories: "Clothing|Pants",
    	skus: "sku401|sku403|sku411",
    	"location:latitude": "",
    	"location:longitude": "",
    	"location:city": "Seattle",
    	"location:state": "WA"
    };
    var product_6 = {
    	id: "prod005",
    	"attribute:name": "Shoes",
    	"attribute:archived": "FALSE",
    	"attribute:url": "http://www.sample.com/products/product006",
    	"attribute:imageUrl": "http://www.sample.com/image/product006.jpg",
    	"attribute:price": "54.63",
    	"attribute:listPrice": "96.85",
    	"attribute:inventoryCount": "0",
    	"attribute:description": "Brown leather shoes",
    	"attribute:currency": "CAD",
    	"attribute:formattedPrice": "Now $54.63",
    	"dimension:SaleStatus": "OnSale",
    	"dimension:Gender": "Women",
    	categories: "Shoes|Clothing|Leather",
    	skus: "sku500",
    	"location:latitude": "",
    	"location:longitude": "",
    	"location:city": "San Francisco",
    	"location:state": "CA"
    };
    var product_7 = {
    	id: "prod006",
    	"attribute:name": "Hat",
    	"attribute:archived": "FALSE",
    	"attribute:url": "http://www.sample.com/products/product007",
    	"attribute:imageUrl": "http://www.sample.com/image/product007.jpg",
    	"attribute:price": "32.50",
    	"attribute:listPrice": "49.99",
    	"attribute:inventoryCount": "",
    	"attribute:description": "Adjustable baseball cap",
    	"attribute:currency": "DKK",
    	"attribute:formattedPrice": "Now 32.50Kr.",
    	"dimension:SaleStatus": "OnSale",
    	"dimension:Gender": "Kids",
    	categories: "Clothing|Accessories",
    	skus: "sku610|sku620|sku630",
    	"location:latitude": "",
    	"location:longitude": "",
    	"location:city": "",
    	"location:state": "TX"
    };
    var product_8 = {
    	id: "prod007",
    	"attribute:name": "Watch",
    	"attribute:archived": "FALSE",
    	"attribute:url": "http://www.sample.com/products/product008",
    	"attribute:imageUrl": "http://www.sample.com/image/product008.jpg",
    	"attribute:price": "10.55",
    	"attribute:listPrice": "10.55",
    	"attribute:inventoryCount": "1",
    	"attribute:description": "Luxury watch",
    	"attribute:currency": "KRW",
    	"attribute:formattedPrice": "Now â‚©10.55",
    	"dimension:SaleStatus": "NotOnSale",
    	"dimension:Gender": "Women",
    	categories: "Accessories",
    	skus: "",
    	"location:latitude": "",
    	"location:longitude": "",
    	"location:city": "Charlotte",
    	"location:state": ""
    };
    var products = {
    	product_1: product_1,
    	product_2: product_2,
    	product_3: product_3,
    	product_4: product_4,
    	product_5: product_5,
    	product_6: product_6,
    	product_7: product_7,
    	product_8: product_8
    };

    const keys = Object.keys(products);
    const randIndex = Math.floor(Math.random() * keys.length);
    const randKey = keys[randIndex]; // string, randomized
    let new_products = JSON.parse(JSON.stringify(products))[randKey];
    let productPrice = new_products['attribute:price'];
    let productName = new_products['attribute:name'];
    let skuCode = new_products['id'];
    let quant = 1;

    /* src\components\Buttons\AddToCart.svelte generated by Svelte v3.48.0 */

    const { console: console_1 } = globals;

    const file$5 = "src\\components\\Buttons\\AddToCart.svelte";

    function create_fragment$5(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Add to cart";
    			attr_dev(button, "class", "px-6 py-2 transition ease-in duration-200 uppercase rounded-full hover:bg-primary hover:text-white border-2 border-gray-900 focus:outline-none");
    			add_location(button, file$5, 18, 0, 574);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*add_to_cart*/ ctx[0], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let $user;
    	validate_store(user, 'user');
    	component_subscribe($$self, user, $$value => $$invalidate(1, $user = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('AddToCart', slots, []);

    	function add_to_cart() {
    		let addToCart = {
    			"pageType": "home",
    			"event": "addToCart",
    			"email": $user.email,
    			"addToCart": {
    				sku: skuCode,
    				quantity: quant,
    				price: productPrice,
    				name: productName
    			}
    		};

    		console.log('addToCart', addToCart);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<AddToCart> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		user,
    		skuCode,
    		quant,
    		productPrice,
    		productName,
    		add_to_cart,
    		$user
    	});

    	return [add_to_cart];
    }

    class AddToCart extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AddToCart",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\components\Products\CarouselItem.svelte generated by Svelte v3.48.0 */
    const file$4 = "src\\components\\Products\\CarouselItem.svelte";

    function create_fragment$4(ctx) {
    	let div7;
    	let div6;
    	let div5;
    	let div0;
    	let p0;
    	let t1;
    	let p1;
    	let t3;
    	let div1;
    	let img;
    	let img_src_value;
    	let t4;
    	let div4;
    	let div2;
    	let ul;
    	let li0;
    	let span0;
    	let a0;
    	let t5;
    	let li1;
    	let span1;
    	let a1;
    	let t6;
    	let li2;
    	let span2;
    	let a2;
    	let t7;
    	let li3;
    	let span3;
    	let a3;
    	let t8;
    	let div3;
    	let p2;
    	let t10;
    	let addtocart;
    	let current;
    	addtocart = new AddToCart({ $$inline: true });

    	const block = {
    		c: function create() {
    			div7 = element("div");
    			div6 = element("div");
    			div5 = element("div");
    			div0 = element("div");
    			p0 = element("p");
    			p0.textContent = "Puma Shoes";
    			t1 = space();
    			p1 = element("p");
    			p1.textContent = "The best shoes in the marketplace";
    			t3 = space();
    			div1 = element("div");
    			img = element("img");
    			t4 = space();
    			div4 = element("div");
    			div2 = element("div");
    			ul = element("ul");
    			li0 = element("li");
    			span0 = element("span");
    			a0 = element("a");
    			t5 = space();
    			li1 = element("li");
    			span1 = element("span");
    			a1 = element("a");
    			t6 = space();
    			li2 = element("li");
    			span2 = element("span");
    			a2 = element("a");
    			t7 = space();
    			li3 = element("li");
    			span3 = element("span");
    			a3 = element("a");
    			t8 = space();
    			div3 = element("div");
    			p2 = element("p");
    			p2.textContent = "65 $";
    			t10 = space();
    			create_component(addtocart.$$.fragment);
    			attr_dev(p0, "class", "text-2xl uppercase text-gray-900 font-bold");
    			add_location(p0, file$4, 8, 16, 307);
    			attr_dev(p1, "class", "uppercase text-sm text-gray-400");
    			add_location(p1, file$4, 11, 16, 433);
    			attr_dev(div0, "class", "prod-title");
    			add_location(div0, file$4, 7, 12, 265);
    			if (!src_url_equal(img.src, img_src_value = "https://www.tailwind-kit.com/images/object/4.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "alt");
    			attr_dev(img, "class", "w-full object-cover object-center");
    			add_location(img, file$4, 16, 16, 627);
    			attr_dev(div1, "class", "prod-img");
    			add_location(div1, file$4, 15, 12, 587);
    			attr_dev(a0, "href", "#blue");
    			attr_dev(a0, "class", "block w-6 h-6 bg-blue-900 rounded-full");
    			add_location(a0, file$4, 23, 32, 1119);
    			attr_dev(span0, "class", "block p-1 border-2 border-gray-500 rounded-full transition ease-in duration-300");
    			add_location(span0, file$4, 22, 28, 991);
    			attr_dev(li0, "class", "mr-4 last:mr-0");
    			add_location(li0, file$4, 21, 24, 934);
    			attr_dev(a1, "href", "#yellow");
    			attr_dev(a1, "class", "block w-6 h-6 bg-yellow-500 rounded-full");
    			add_location(a1, file$4, 29, 32, 1518);
    			attr_dev(span1, "class", "block p-1 border-2 border-white hover:border-gray-500 rounded-full transition ease-in duration-300");
    			add_location(span1, file$4, 28, 28, 1371);
    			attr_dev(li1, "class", "mr-4 last:mr-0");
    			add_location(li1, file$4, 27, 24, 1314);
    			attr_dev(a2, "href", "#red");
    			attr_dev(a2, "class", "block w-6 h-6 bg-red-500 rounded-full");
    			add_location(a2, file$4, 35, 32, 1921);
    			attr_dev(span2, "class", "block p-1 border-2 border-white hover:border-gray-500 rounded-full transition ease-in duration-300");
    			add_location(span2, file$4, 34, 28, 1774);
    			attr_dev(li2, "class", "mr-4 last:mr-0");
    			add_location(li2, file$4, 33, 24, 1717);
    			attr_dev(a3, "href", "#green");
    			attr_dev(a3, "class", "block w-6 h-6 bg-green-500 rounded-full");
    			add_location(a3, file$4, 41, 32, 2318);
    			attr_dev(span3, "class", "block p-1 border-2 border-white hover:border-gray-500 rounded-full transition ease-in duration-300");
    			add_location(span3, file$4, 40, 28, 2171);
    			attr_dev(li3, "class", "mr-4 last:mr-0");
    			add_location(li3, file$4, 39, 24, 2114);
    			attr_dev(ul, "class", "flex flex-row justify-center items-center");
    			add_location(ul, file$4, 20, 20, 854);
    			add_location(div2, file$4, 19, 16, 827);
    			attr_dev(p2, "class", "font-bold text-xl");
    			add_location(p2, file$4, 48, 20, 2662);
    			attr_dev(div3, "class", "flex flex-col md:flex-row justify-between items-center text-gray-900");
    			add_location(div3, file$4, 47, 16, 2558);
    			attr_dev(div4, "class", "prod-info grid gap-10");
    			add_location(div4, file$4, 18, 12, 774);
    			attr_dev(div5, "class", "card flex flex-col justify-center p-10 bg-white rounded-lg shadow-2xl");
    			add_location(div5, file$4, 6, 8, 168);
    			attr_dev(div6, "class", "w-full p-4");
    			add_location(div6, file$4, 5, 4, 134);
    			attr_dev(div7, "class", "w-80 flex justify-center items-center");
    			add_location(div7, file$4, 4, 0, 77);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div7, anchor);
    			append_dev(div7, div6);
    			append_dev(div6, div5);
    			append_dev(div5, div0);
    			append_dev(div0, p0);
    			append_dev(div0, t1);
    			append_dev(div0, p1);
    			append_dev(div5, t3);
    			append_dev(div5, div1);
    			append_dev(div1, img);
    			append_dev(div5, t4);
    			append_dev(div5, div4);
    			append_dev(div4, div2);
    			append_dev(div2, ul);
    			append_dev(ul, li0);
    			append_dev(li0, span0);
    			append_dev(span0, a0);
    			append_dev(ul, t5);
    			append_dev(ul, li1);
    			append_dev(li1, span1);
    			append_dev(span1, a1);
    			append_dev(ul, t6);
    			append_dev(ul, li2);
    			append_dev(li2, span2);
    			append_dev(span2, a2);
    			append_dev(ul, t7);
    			append_dev(ul, li3);
    			append_dev(li3, span3);
    			append_dev(span3, a3);
    			append_dev(div4, t8);
    			append_dev(div4, div3);
    			append_dev(div3, p2);
    			append_dev(div3, t10);
    			mount_component(addtocart, div3, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(addtocart.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(addtocart.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div7);
    			destroy_component(addtocart);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('CarouselItem', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<CarouselItem> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ AddToCart });
    	return [];
    }

    class CarouselItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CarouselItem",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\components\Products\Carousel.svelte generated by Svelte v3.48.0 */
    const file$3 = "src\\components\\Products\\Carousel.svelte";

    function create_fragment$3(ctx) {
    	let div6;
    	let div2;
    	let div0;
    	let carouselitem0;
    	let t0;
    	let carouselitem1;
    	let t1;
    	let carouselitem2;
    	let t2;
    	let carouselitem3;
    	let t3;
    	let div1;
    	let a0;
    	let t5;
    	let a1;
    	let t7;
    	let div5;
    	let div3;
    	let carouselitem4;
    	let t8;
    	let carouselitem5;
    	let t9;
    	let carouselitem6;
    	let t10;
    	let carouselitem7;
    	let t11;
    	let div4;
    	let a2;
    	let t13;
    	let a3;
    	let current;
    	carouselitem0 = new CarouselItem({ $$inline: true });
    	carouselitem1 = new CarouselItem({ $$inline: true });
    	carouselitem2 = new CarouselItem({ $$inline: true });
    	carouselitem3 = new CarouselItem({ $$inline: true });
    	carouselitem4 = new CarouselItem({ $$inline: true });
    	carouselitem5 = new CarouselItem({ $$inline: true });
    	carouselitem6 = new CarouselItem({ $$inline: true });
    	carouselitem7 = new CarouselItem({ $$inline: true });

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			create_component(carouselitem0.$$.fragment);
    			t0 = space();
    			create_component(carouselitem1.$$.fragment);
    			t1 = space();
    			create_component(carouselitem2.$$.fragment);
    			t2 = space();
    			create_component(carouselitem3.$$.fragment);
    			t3 = space();
    			div1 = element("div");
    			a0 = element("a");
    			a0.textContent = "❮";
    			t5 = space();
    			a1 = element("a");
    			a1.textContent = "❯";
    			t7 = space();
    			div5 = element("div");
    			div3 = element("div");
    			create_component(carouselitem4.$$.fragment);
    			t8 = space();
    			create_component(carouselitem5.$$.fragment);
    			t9 = space();
    			create_component(carouselitem6.$$.fragment);
    			t10 = space();
    			create_component(carouselitem7.$$.fragment);
    			t11 = space();
    			div4 = element("div");
    			a2 = element("a");
    			a2.textContent = "❮";
    			t13 = space();
    			a3 = element("a");
    			a3.textContent = "❯";
    			attr_dev(div0, "class", "carousel-item mx-20");
    			add_location(div0, file$3, 6, 6, 194);
    			attr_dev(a0, "href", "#slide1");
    			attr_dev(a0, "class", "btn btn-primary");
    			add_location(a0, file$3, 13, 8, 460);
    			attr_dev(a1, "href", "#slide2");
    			attr_dev(a1, "class", "btn btn-primary");
    			add_location(a1, file$3, 14, 8, 518);
    			attr_dev(div1, "class", "absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2");
    			add_location(div1, file$3, 12, 6, 357);
    			attr_dev(div2, "id", "slide1");
    			attr_dev(div2, "class", "carousel-item relative w-full");
    			add_location(div2, file$3, 5, 2, 131);
    			attr_dev(div3, "class", "carousel-item mx-20");
    			add_location(div3, file$3, 18, 4, 654);
    			attr_dev(a2, "href", "#slide1");
    			attr_dev(a2, "class", "btn btn-primary");
    			add_location(a2, file$3, 25, 6, 906);
    			attr_dev(a3, "href", "#slide1");
    			attr_dev(a3, "class", "btn btn-primary");
    			add_location(a3, file$3, 26, 6, 962);
    			attr_dev(div4, "class", "absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2");
    			add_location(div4, file$3, 24, 4, 805);
    			attr_dev(div5, "id", "slide2");
    			attr_dev(div5, "class", "carousel-item relative w-full");
    			add_location(div5, file$3, 17, 2, 593);
    			attr_dev(div6, "class", "carousel w-full bg-base-200 rounded-box");
    			add_location(div6, file$3, 4, 0, 74);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div2);
    			append_dev(div2, div0);
    			mount_component(carouselitem0, div0, null);
    			append_dev(div0, t0);
    			mount_component(carouselitem1, div0, null);
    			append_dev(div0, t1);
    			mount_component(carouselitem2, div0, null);
    			append_dev(div0, t2);
    			mount_component(carouselitem3, div0, null);
    			append_dev(div2, t3);
    			append_dev(div2, div1);
    			append_dev(div1, a0);
    			append_dev(div1, t5);
    			append_dev(div1, a1);
    			append_dev(div6, t7);
    			append_dev(div6, div5);
    			append_dev(div5, div3);
    			mount_component(carouselitem4, div3, null);
    			append_dev(div3, t8);
    			mount_component(carouselitem5, div3, null);
    			append_dev(div3, t9);
    			mount_component(carouselitem6, div3, null);
    			append_dev(div3, t10);
    			mount_component(carouselitem7, div3, null);
    			append_dev(div5, t11);
    			append_dev(div5, div4);
    			append_dev(div4, a2);
    			append_dev(div4, t13);
    			append_dev(div4, a3);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(carouselitem0.$$.fragment, local);
    			transition_in(carouselitem1.$$.fragment, local);
    			transition_in(carouselitem2.$$.fragment, local);
    			transition_in(carouselitem3.$$.fragment, local);
    			transition_in(carouselitem4.$$.fragment, local);
    			transition_in(carouselitem5.$$.fragment, local);
    			transition_in(carouselitem6.$$.fragment, local);
    			transition_in(carouselitem7.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(carouselitem0.$$.fragment, local);
    			transition_out(carouselitem1.$$.fragment, local);
    			transition_out(carouselitem2.$$.fragment, local);
    			transition_out(carouselitem3.$$.fragment, local);
    			transition_out(carouselitem4.$$.fragment, local);
    			transition_out(carouselitem5.$$.fragment, local);
    			transition_out(carouselitem6.$$.fragment, local);
    			transition_out(carouselitem7.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div6);
    			destroy_component(carouselitem0);
    			destroy_component(carouselitem1);
    			destroy_component(carouselitem2);
    			destroy_component(carouselitem3);
    			destroy_component(carouselitem4);
    			destroy_component(carouselitem5);
    			destroy_component(carouselitem6);
    			destroy_component(carouselitem7);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Carousel', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Carousel> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ CarouselItem });
    	return [];
    }

    class Carousel extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Carousel",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\components\Utility\Divider.svelte generated by Svelte v3.48.0 */

    const file$2 = "src\\components\\Utility\\Divider.svelte";

    function create_fragment$2(ctx) {
    	let div1;
    	let div0;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			attr_dev(div0, "class", "divider");
    			add_location(div0, file$2, 1, 4, 40);
    			attr_dev(div1, "class", "flex flex-col w-full");
    			add_location(div1, file$2, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Divider', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Divider> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Divider extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Divider",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\components\Footers\Footer.svelte generated by Svelte v3.48.0 */

    const file$1 = "src\\components\\Footers\\Footer.svelte";

    function create_fragment$1(ctx) {
    	let footer;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let p;
    	let t1;
    	let br;
    	let t2;
    	let t3;
    	let div2;
    	let span;
    	let t5;
    	let div1;
    	let a0;
    	let svg0;
    	let path0;
    	let t6;
    	let a1;
    	let svg1;
    	let path1;
    	let t7;
    	let a2;
    	let svg2;
    	let path2;

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			p = element("p");
    			t1 = text("Industries Ltd.");
    			br = element("br");
    			t2 = text("Lorem ipsum dolor sit amet");
    			t3 = space();
    			div2 = element("div");
    			span = element("span");
    			span.textContent = "Social";
    			t5 = space();
    			div1 = element("div");
    			a0 = element("a");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			t6 = space();
    			a1 = element("a");
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			t7 = space();
    			a2 = element("a");
    			svg2 = svg_element("svg");
    			path2 = svg_element("path");
    			if (!src_url_equal(img.src, img_src_value = "https://cdn-icons-png.flaticon.com/512/1245/1245007.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "object-contain h-16 w-16");
    			attr_dev(img, "alt", "alt");
    			add_location(img, file$1, 2, 4, 78);
    			add_location(br, file$1, 3, 24, 215);
    			add_location(p, file$1, 3, 6, 197);
    			add_location(div0, file$1, 1, 4, 67);
    			attr_dev(span, "class", "footer-title");
    			add_location(span, file$1, 6, 6, 281);
    			attr_dev(path0, "d", "M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z");
    			add_location(path0, file$1, 8, 151, 521);
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "width", "24");
    			attr_dev(svg0, "height", "24");
    			attr_dev(svg0, "viewBox", "0 0 24 24");
    			attr_dev(svg0, "class", "fill-current");
    			add_location(svg0, file$1, 8, 47, 417);
    			attr_dev(a0, "class", "");
    			attr_dev(a0, "href", "https://google.com");
    			add_location(a0, file$1, 8, 8, 378);
    			attr_dev(path1, "d", "M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z");
    			add_location(path1, file$1, 9, 142, 1200);
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "width", "24");
    			attr_dev(svg1, "height", "24");
    			attr_dev(svg1, "viewBox", "0 0 24 24");
    			attr_dev(svg1, "class", "fill-current");
    			add_location(svg1, file$1, 9, 38, 1096);
    			attr_dev(a1, "href", "https://google.com");
    			add_location(a1, file$1, 9, 8, 1066);
    			attr_dev(path2, "d", "M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z");
    			add_location(path2, file$1, 10, 142, 1614);
    			attr_dev(svg2, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg2, "width", "24");
    			attr_dev(svg2, "height", "24");
    			attr_dev(svg2, "viewBox", "0 0 24 24");
    			attr_dev(svg2, "class", "fill-current");
    			add_location(svg2, file$1, 10, 38, 1510);
    			attr_dev(a2, "href", "https://google.com");
    			add_location(a2, file$1, 10, 8, 1480);
    			attr_dev(div1, "class", "grid grid-flow-col gap-4");
    			add_location(div1, file$1, 7, 6, 330);
    			add_location(div2, file$1, 5, 4, 268);
    			attr_dev(footer, "class", "footer p-10 bg-base-200 text-neutral-content");
    			add_location(footer, file$1, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, div0);
    			append_dev(div0, img);
    			append_dev(div0, t0);
    			append_dev(div0, p);
    			append_dev(p, t1);
    			append_dev(p, br);
    			append_dev(p, t2);
    			append_dev(footer, t3);
    			append_dev(footer, div2);
    			append_dev(div2, span);
    			append_dev(div2, t5);
    			append_dev(div2, div1);
    			append_dev(div1, a0);
    			append_dev(a0, svg0);
    			append_dev(svg0, path0);
    			append_dev(div1, t6);
    			append_dev(div1, a1);
    			append_dev(a1, svg1);
    			append_dev(svg1, path1);
    			append_dev(div1, t7);
    			append_dev(div1, a2);
    			append_dev(a2, svg2);
    			append_dev(svg2, path2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Footer', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.48.0 */
    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let div;
    	let pagetype;
    	let t0;
    	let navbar;
    	let t1;
    	let breadcrumb;
    	let t2;
    	let form;
    	let t3;
    	let divider0;
    	let t4;
    	let carousel;
    	let t5;
    	let divider1;
    	let t6;
    	let footer;
    	let current;
    	pagetype = new PageType({ $$inline: true });
    	navbar = new Navbar({ $$inline: true });
    	breadcrumb = new Breadcrumb({ $$inline: true });
    	form = new Form({ $$inline: true });
    	divider0 = new Divider({ $$inline: true });
    	carousel = new Carousel({ $$inline: true });
    	divider1 = new Divider({ $$inline: true });
    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(pagetype.$$.fragment);
    			t0 = space();
    			create_component(navbar.$$.fragment);
    			t1 = space();
    			create_component(breadcrumb.$$.fragment);
    			t2 = space();
    			create_component(form.$$.fragment);
    			t3 = space();
    			create_component(divider0.$$.fragment);
    			t4 = space();
    			create_component(carousel.$$.fragment);
    			t5 = space();
    			create_component(divider1.$$.fragment);
    			t6 = space();
    			create_component(footer.$$.fragment);
    			attr_dev(div, "class", "container mx-auto px-10");
    			add_location(div, file, 10, 0, 501);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(pagetype, div, null);
    			append_dev(div, t0);
    			mount_component(navbar, div, null);
    			append_dev(div, t1);
    			mount_component(breadcrumb, div, null);
    			append_dev(div, t2);
    			mount_component(form, div, null);
    			append_dev(div, t3);
    			mount_component(divider0, div, null);
    			append_dev(div, t4);
    			mount_component(carousel, div, null);
    			append_dev(div, t5);
    			mount_component(divider1, div, null);
    			append_dev(div, t6);
    			mount_component(footer, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(pagetype.$$.fragment, local);
    			transition_in(navbar.$$.fragment, local);
    			transition_in(breadcrumb.$$.fragment, local);
    			transition_in(form.$$.fragment, local);
    			transition_in(divider0.$$.fragment, local);
    			transition_in(carousel.$$.fragment, local);
    			transition_in(divider1.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(pagetype.$$.fragment, local);
    			transition_out(navbar.$$.fragment, local);
    			transition_out(breadcrumb.$$.fragment, local);
    			transition_out(form.$$.fragment, local);
    			transition_out(divider0.$$.fragment, local);
    			transition_out(carousel.$$.fragment, local);
    			transition_out(divider1.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(pagetype);
    			destroy_component(navbar);
    			destroy_component(breadcrumb);
    			destroy_component(form);
    			destroy_component(divider0);
    			destroy_component(carousel);
    			destroy_component(divider1);
    			destroy_component(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		PageType,
    		Navbar,
    		Breadcrumb,
    		Form,
    		Carousel,
    		Divider,
    		Footer
    	});

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
