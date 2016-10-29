var tools = {
	splitByTag: splitByTag,
	getLevel: getLevel
};
module.exports = tools;

// 分割数组成多个数组
var chunk = function (array, size) {
	var result = [];
	for (var i = 0; i < Math.ceil(array.length / size); i++) {
		var start = i * size;
		var end = start + size;
		result.push(array.slice(start, end));
	}
	return result;
}

// 合并数组
var merge = function () {
	return Array.prototype.concat.apply([], arguments);
}


// 用标签分割数字
function splitByTag(number, tag) {
	// ***当前只支持正整数

	// 转换成字符串
	if (typeof(number) !== 'string') {
		number = '' + number;
	}

	// 正整数
	// 带小数
	// 为负数

	// 数组转换
	var list = number.split('').reverse();

	var list_array = chunk(list, 3);
	for (var i = 0; i + 2 < list_array.length + 1; i++) {
		list_array[i].splice(3, 0, tag);
	}

	// 清空数组并重新合并
	list = [];
	for (var j = 0; j < list_array.length; j++) {
		list = list.concat(list_array[j]);
	}
	
	// 添加完后重新翻转
	list.reverse();

	// 清空number
	number = '';

	for (var j = 0; j < list.length; j++) {
		number += list[j];
	}

	return number;
}


// 根据等级获取图片
function getLevel(level) {
	if (!level) {
		return 'null.png';
	};

	if (level > 170) {
		return '170.png';
	}

	if (parseInt(level / 10) <= (level / 10)) {
		return '' + Math.ceil(level / 10) * 10 + '.png';
	}
}