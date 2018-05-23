/**
 * Generate a donut chart.
 * 
 * @param {object} parent The parent element to place the chart within.
 * @param {object} spec The chart details { radius, stroke, scale, items } (See README).
 */
function DonutChart(parent, spec) {

	/* Transformation matrix (rotate and mirror) to correct orientation:
	   * \[
	   *   \left[
	   *   \begin{array}{ccc}
	   *      0 & -1 & 0 \\
	   *     -1 &  0 & 0 \\
	   *      0 &  0 & 1
	   *   \end{array}
	   *   \right]
	   * \]
	   */
	var correct_orientation = "matrix(0 -1 -1 0 0 0)";

	var __get_def_radius_from_parent = function (parent) {
		if (parent.clientWidth < parent.clientHeight)
			return parent.clientWidth /2
		else
			return parent.clientHeight /2
	}

	var __polar2xy = function (a, radius) {
		return {
			x: Math.cos(a * 2 * Math.PI) * radius,
			y: -Math.sin(a * 2 * Math.PI) * radius
		};
	};

	var __gen_arc_path = function (cx, cy, radius, start, offset) {
		var end = __polar2xy(start + offset, radius);
		start = __polar2xy(start, radius);
		return [
			"M",
			cx + start.x,
			cy + start.y,
			"A",
			radius,
			radius,
			0,
			+(offset > 0.5),
			0,
			cx + end.x,
			cy + end.y
		].join(" ");
	};

	var __gen_chart_item = function (out, c, radius, prev, cur, i, stroke) {
		out.push([
			"path",
			{
				d: __gen_arc_path(c, c, radius, prev, cur),
				class: "chart-item-" + i,
				fill: "transparent",
				"stroke-width": stroke
			}
		]);
	};

	var __gen_chart = function (chart) {
		var prev = 0,
			out = [];
		// FIXME get radius and stroke-width from CSS
		var c = chart.radius,
			radius = chart.radius - chart.stroke / 2;
		for (var i in chart.items) {
			cur = chart.items[i];
			__gen_chart_item(out, c, radius, prev, cur.value, i, chart.stroke);
			prev += cur.value;
		}
		if (prev < 1) {
			__gen_chart_item(out, c, radius, prev, 1 - prev, "bg", chart.stroke);
		}
		return out;
	};

	var __create_tag_tree = function (elem) {
		var root = document.createElementNS("http://www.w3.org/2000/svg", elem[0]);
		var attr = elem[1];
		// Set attributes
		for (var i in attr) {
			var a = document.createAttribute(i);
			a.value = attr[i];
			root.setAttributeNode(a);
		}
		// Create children nodes
		if (elem.length > 2) {
			var children = elem[2];
			for (var i in children) {
				var c = __create_tag_tree(children[i]);
				root.appendChild(c);
			}
		}
		return root;
	};

	// Need to fix spec values that will cause a broken SVG
	var __fix_spec_items = function (spec) {
		if (spec.items) {
			for (var i in spec.items) {
				if (spec.items[i].value == 1) spec.items[i].value = 0.9999999
				if (spec.items[i].value == 0) spec.items[i].value = 0.0000001
			}
		}
		return spec
	}

	var __gen_code = function (spec) {
		return __create_tag_tree([
			"svg",
			{
				transform: correct_orientation,
				class: "chart-donut",
				width: spec.radius * 2,
				height: spec.radius * 2
			},
			__gen_chart(spec)
		]);
	};

	var __is_dict = function (v) {
		return v && typeof v === "object" && !(v instanceof Array);
	};

	/**
	 * Updates the state of the chart.
	 * 
	 * @param {object} spec The chart items to update { items } (See README).
	 */
	DonutChart.prototype.update = function (spec) {
		// Merge the new spec - A value of 1 will fail so need to make it as big as possible
		__fix_spec_items(spec)
		for (var i in spec) {
			this.spec[i] = spec[i];
		}

		if (this.parent) {
			var code = __gen_code(this.spec);
			// TODO can we switch the elements in place?
			if (this.element) this.element.remove();
			this.element = this.parent.appendChild(code);
		} else {
			throw new Error("No parent defined for the chart.")
		}
	};

	if (!parent) throw new TypeError("The parent is required.")
	if (!spec) throw new TypeError("The chart spec is required.")
	if (!spec.items) throw new Error("The spec must have items provided.")
	__fix_spec_items(spec)

	// Set defaults if spec elements not provided.
	if (!spec.radius) spec.radius = __get_def_radius_from_parent(parent)
	if (!spec.stroke) spec.stroke = 25
	if (!spec.scale) spec.scale = 100

	this.parent = parent;
	this.spec = spec;
	this.element = null;

	this.update({});
}
