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

    var rows = [];

    async.each(funds, function(fund, callback){

        var bao = {
            fundName: '',
            sevenRateReturn: '',
            tenThousandReturn: '',
            date: ''
        };

        var options = {
            url: 'http://fund.eastmoney.com/' + fund.code + '.html',
            encoding: null
        };


        function parse(body) {

            var $ = cheerio.load(body);

            bao.fundName = $('div.bktit_new > a').text().trim();
            bao.sevenRateReturn = $("div.bkinfo_new table tr:nth-child(2) td:nth-child(2)").text().trim();
            bao.tenThousandReturn = $("div.bkinfo_new table tr:nth-child(1) td:nth-child(4) span").text() + "元";
            bao.date = $("div.bkinfo_new table tr:nth-child(1) td:nth-child(2)").text().trim();
        }



        request(options, function(error, response, body){
            if (!error && response.statusCode == 200) {

                parse(iconv.decode(body, 'gbk'));

                rows.push(
                    [fund.bao, bao.fundName, bao.sevenRateReturn, bao.tenThousandReturn.trim(), bao.date]
                );

                callback();

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