/*! RESOURCE: /scripts/highcharts/modules/export-csv.js */
(function(factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory;
    } else {
        factory(Highcharts);
    }
})(function(Highcharts) {
    'use strict';
    var each = Highcharts.each,
        pick = Highcharts.pick,
        seriesTypes = Highcharts.seriesTypes,
        downloadAttrSupported = document.createElement('a').download !== undefined;
    Highcharts.setOptions({
        lang: {
            downloadCSV: 'Download CSV',
            downloadXLS: 'Download XLS',
            viewData: 'View data table'
        }
    });
    Highcharts.Chart.prototype.getDataRows = function() {
        var options = (this.options.exporting || {}).csv || {},
            xAxis = this.xAxis[0],
            rows = {},
            rowArr = [],
            dataRows,
            names = [],
            i,
            x,
            xTitle,
            dateFormat = options.dateFormat || '%Y-%m-%d %H:%M:%S',
            columnHeaderFormatter = options.columnHeaderFormatter || function(item, key, keyLength) {
                if (item instanceof Highcharts.Axis) {
                    return (item.options.title && item.options.title.text) ||
                        (item.isDatetimeAxis ? 'DateTime' : 'Category');
                }
                return item.name + (keyLength > 1 ? ' (' + key + ')' : '');
            };
        i = 0;
        each(this.series, function(series) {
            var keys = series.options.keys,
                pointArrayMap = keys || series.pointArrayMap || ['y'],
                valueCount = pointArrayMap.length,
                requireSorting = series.requireSorting,
                categoryMap = {},
                j;
            each(pointArrayMap, function(prop) {
                categoryMap[prop] = (series[prop + 'Axis'] && series[prop + 'Axis'].categories) || [];
            });
            if (series.options.includeInCSVExport !== false && series.visible !== false) {
                j = 0;
                while (j < valueCount) {
                    names.push(columnHeaderFormatter(series, pointArrayMap[j], pointArrayMap.length));
                    j = j + 1;
                }
                each(series.points, function(point, pIdx) {
                    var key = requireSorting ? point.x : pIdx,
                        prop,
                        val;
                    j = 0;
                    if (!rows[key]) {
                        rows[key] = [];
                    }
                    rows[key].x = point.x;
                    if (!series.xAxis || series.exportKey === 'name') {
                        rows[key].name = point.name;
                    }
                    while (j < valueCount) {
                        prop = pointArrayMap[j];
                        val = point[prop];
                        rows[key][i + j] = pick(categoryMap[prop][val], val);
                        j = j + 1;
                    }
                });
                i = i + j;
            }
        });
        for (x in rows) {
            if (rows.hasOwnProperty(x)) {
                rowArr.push(rows[x]);
            }
        }
        rowArr.sort(function(a, b) {
            return a.x - b.x;
        });
        xTitle = columnHeaderFormatter(xAxis);
        dataRows = [
            [xTitle].concat(names)
        ];
        each(rowArr, function(row) {
            var category = row.name;
            if (!category) {
                if (xAxis.isDatetimeAxis) {
                    if (row.x instanceof Date) {
                        row.x = row.x.getTime();
                    }
                    category = Highcharts.dateFormat(dateFormat, row.x);
                } else if (xAxis.categories) {
                    category = pick(xAxis.names[row.x], xAxis.categories[row.x], row.x)
                } else {
                    category = row.x;
                }
            }
            row.unshift(category);
            dataRows.push(row);
        });
        return dataRows;
    };
    Highcharts.Chart.prototype.getCSV = function(useLocalDecimalPoint) {
        var csv = '',
            rows = this.getDataRows(),
            options = (this.options.exporting || {}).csv || {},
            itemDelimiter = options.itemDelimiter || ',',
            lineDelimiter = options.lineDelimiter || '\n';
        each(rows, function(row, i) {
            var val = '',
                j = row.length,
                n = useLocalDecimalPoint ? (1.1).toLocaleString()[1] : '.';
            while (j--) {
                val = row[j];
                if (typeof val === "string") {
                    val = '"' + val + '"';
                }
                if (typeof val === 'number') {
                    if (n === ',') {
                        val = val.toString().replace(".", ",");
                    }
                }
                row[j] = val;
            }
            csv += row.join(itemDelimiter);
            if (i < rows.length - 1) {
                csv += lineDelimiter;
            }
        });
        return csv;
    };
    Highcharts.Chart.prototype.getTable = function(useLocalDecimalPoint) {
        var html = '<table>',
            rows = this.getDataRows();
        each(rows, function(row, i) {
            var tag = i ? 'td' : 'th',
                val,
                j,
                n = useLocalDecimalPoint ? (1.1).toLocaleString()[1] : '.';
            html += '<tr>';
            for (j = 0; j < row.length; j = j + 1) {
                val = row[j];
                if (typeof val === 'number') {
                    val = val.toString();
                    if (n === ',') {
                        val = val.replace('.', n);
                    }
                    html += '<' + tag + ' class="number">' + val + '</' + tag + '>';
                } else {
                    html += '<' + tag + '>' + (val === undefined ? '' : val) + '</' + tag + '>';
                }
            }
            html += '</tr>';
        });
        html += '</table>';
        return html;
    };

    function getContent(chart, href, extension, content, MIME) {
        var a,
            blobObject,
            name,
            options = (chart.options.exporting || {}).csv || {},
            url = options.url || 'http://www.highcharts.com/studies/csv-export/download.php';
        if (chart.options.exporting.filename) {
            name = chart.options.exporting.filename;
        } else if (chart.title) {
            name = chart.title.textStr.replace(/ /g, '-').toLowerCase();
        } else {
            name = 'chart';
        }
        if (window.Blob && window.navigator.msSaveOrOpenBlob) {
            blobObject = new Blob([content]);
            window.navigator.msSaveOrOpenBlob(blobObject, name + '.' + extension);
        } else if (downloadAttrSupported) {
            a = document.createElement('a');
            a.href = href;
            a.target = '_blank';
            a.download = name + '.' + extension;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } else {
            Highcharts.post(url, {
                data: content,
                type: MIME,
                extension: extension
            });
        }
    }
    Highcharts.Chart.prototype.downloadCSV = function() {
        var csv = this.getCSV(true);
        getContent(
            this,
            'data:text/csv,\uFEFF' + csv.replace(/\n/g, '%0A'),
            'csv',
            csv,
            'text/csv'
        );
    };
    Highcharts.Chart.prototype.downloadXLS = function() {
        var uri = 'data:application/vnd.ms-excel;base64,',
            template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">' +
            '<head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>' +
            '<x:Name>Ark1</x:Name>' +
            '<x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->' +
            '<style>td{border:none;font-family: Calibri, sans-serif;} .number{mso-number-format:"0.00";}</style>' +
            '<meta name=ProgId content=Excel.Sheet>' +
            '<meta charset=UTF-8>' +
            '</head><body>' +
            this.getTable(true) +
            '</body></html>',
            base64 = function(s) {
                return window.btoa(unescape(encodeURIComponent(s)));
            };
        getContent(
            this,
            uri + base64(template),
            'xls',
            template,
            'application/vnd.ms-excel'
        );
    };
    Highcharts.Chart.prototype.viewData = function() {
        if (!this.insertedTable) {
            var div = document.createElement('div');
            div.className = 'highcharts-data-table';
            this.renderTo.parentNode.insertBefore(div, this.renderTo.nextSibling);
            div.innerHTML = this.getTable();
            this.insertedTable = true;
        }
    };
    if (Highcharts.getOptions().exporting) {
        Highcharts.getOptions().exporting.buttons.contextButton.menuItems.push({
            textKey: 'downloadCSV',
            onclick: function() {
                this.downloadCSV();
            }
        }, {
            textKey: 'downloadXLS',
            onclick: function() {
                this.downloadXLS();
            }
        }, {
            textKey: 'viewData',
            onclick: function() {
                this.viewData();
            }
        });
    }
    if (seriesTypes.map) {
        seriesTypes.map.prototype.exportKey = 'name';
    }
    if (seriesTypes.mapbubble) {
        seriesTypes.mapbubble.prototype.exportKey = 'name';
    }
});;