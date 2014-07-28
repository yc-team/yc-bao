'use strict';

var async = require('async');
var request = require('request');
var cheerio = require('cheerio');
var iconv = require('iconv-lite');
var Table = require('cli-table');

module.exports = function(config){

	var funds = config.funds;

	var table = new Table({
		head: ['名称', '合作基金', '7日年化', '万份收益', '数据日期']
	});

	var options = {
		url: 'http://fund.eastmoney.com/' + fund.code + '.html'
	};

	var rows = [];

	async.forEach(funds, function(fund, callback){

		var bao = {
			fundName: '',
			sevenRateReturn: '',
			data: ''
		};


		function parse(body) {
			$ = cheerio.load(body);
			bao.fundName = $('div.bktit_new > a').text().trim();
			bao.sevenRateReturn = $("div.bkinfo_new table tr:nth-child(2) td:nth-child(2)").text().trim();
			bao.date = $("div.bkinfo_new table tr:nth-child(1) td:nth-child(2)").text().trim();
		}



		request(options, function(error, response, body){
			if (!error && response.statusCode == 200) {
				parse(iconv.decode(body, 'gbk'));

				rows.push(
					[fund.bao, bao.fundName, bao.sevenRateReturn, bao.date]
				);
			}
		});

	}, function(error) {
		//sort
		rows.sort(function(a, b){
			return parseFloat(b[3]) - parseFloat(a[3]);
		});


		rows.forEach(function(r){
			table.push(r);
		});


		console.log(table.toString());
	});

};