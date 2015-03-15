$('body').prepend('<div id="exchangeSelect" style="position:fixed; top:10px; left:10px;"><form><select><option value="" selected>為替</option><option value="USD">ドル</option><option value="EUR">ユーロ</option><option value="PHP">ペソ</option></select></form></div>');

var priceArray = [];
var rate;
var currency;
var counter = 0;
var replacePrice;
var symbol;
var preSymbol;

$('#exchangeSelect select').on("change", function(){
	currency = $(this).val();
	exchangeDooone(currency);
});

function exchangeDooone(currency){
	var urlText = "http://api.aoikujira.com/kawase/get.php?format=jsonp2&callback=json&code=" + currency;
	$.ajax({
		url:urlText,
		type: "GET",
		dataType: "jsonp"
	}).done(function(data){
		rate = 1/data.JPY;
        switch(currency){
            case 'USD':
                symbol = '$:';
                break;
            case 'EUR':
                symbol = '€:';
                break;
            case 'PHP':
                symbol = '₱:';
                break;
        }

		if(priceArray.length === 0){
			firstChange();
		} else {
			multiChange();
            console.log('////////////////////////////////');
		}
	}).fail(function(){alert('通信エラーっす')});
};







function firstChange(){
    $('p:contains("円"), span:contains("円")').each( function(){
        var replaceHtml = $(this).html();

        //HTMLから数字を抽出＋カンマがあったら取る
        if(replaceHtml.search(/\d{1,3}(,\d{3})+/) !== -1){
            replacePrice = replaceHtml.match(/\d{1,3}(,\d{3})+/);
            replacePrice = replacePrice[0].replace(/,/g, '');
        } else if(replaceHtml.search(/\d+/) !== -1){
            replacePrice = replaceHtml.match(/\d+/);
            replacePrice = replacePrice[0];
        }

        //海外金額埋め込み
        if(replaceHtml.search(/\d+(,\d{1,3})*円/) !== -1){
						//日本金額を配列に順番に保存
						priceArray.push(replacePrice);
						replacePrice = priceProcess(replacePrice);
            $(this).html(replaceHtml.replace(/\d+(,\d{1,3})*円/g, symbol + replacePrice));
        } else if(replaceHtml.search(/<.+?>\d+(,\d{1,3})*?<\/.+?>円/) !== -1){ //金額がタグで囲まれている場合
						//日本金額を配列に順番に保存
						priceArray.push(replacePrice);
						replacePrice = priceProcess(replacePrice);
						$(this).html(replaceHtml.replace(/(<.+?>)\d+(,\d{1,3})*?(<\/.+?>)円/g, symbol + '$1' + replacePrice + '$3'));
        }
    });

    $('p:contains("税込"), span:contains("税込")').each( function(){
        var replaceHtml = $(this).html();
        $(this).html(replaceHtml.replace(/税込/g, 'Tax in'));
    });
    preSymbol = symbol;
}




function priceProcess(price){ //金額をいろいろ処理整形
    //日本金額から海外金額へ変換
    price = Number(price) * rate;
    //小数点2桁まで丸める
    price = Math.floor(price * 100)/100;
    //4桁以上の数字だったらカンマをつける
    price = String(price).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
    return price;
}




function multiChange(){
    $('p:contains(' + '"' + preSymbol + '"' + '), span:contains(' + '"' + preSymbol + '"' + ')').each( function(){

				if(preSymbol.indexOf('$') !== -1){preSymbol = '\\$:';}
        if(symbol.indexOf('$') !== -1){symbol = '\$:';}
        console.log(preSymbol +', ' + symbol)

        var replaceHtml = $(this).html();
				
        //海外金額埋め込み
        if(replaceHtml.match(new RegExp(preSymbol + '<.+?>\\d+(,\\d{1,3})*(\\.\\d{1,3})*?<\\/.+?>'))){ //金額がタグで囲まれている場合
						//日本円で記録していた配列から数字を取り出して処理
						replacePrice = priceArray.slice(counter, counter + 1);
						replacePrice = priceProcess(replacePrice);
            $(this).html(replaceHtml.replace(new RegExp(preSymbol + '(<.+?>)\\d+(,\\d{1,3})*(\\.\\d{1,3})*?(<\\/.+?>)', 'g'), symbol + '$1' + replacePrice + '$4'));
            counter += 1;
        } else if(replaceHtml.match(new RegExp(preSymbol + '\\d+(,\\d{1,3})*(\\.\\d{1,3})*'))){
						//日本円で記録していた配列から数字を取り出して処理
						replacePrice = priceArray.slice(counter, counter + 1);
						replacePrice = priceProcess(replacePrice);
            $(this).html(replaceHtml.replace(new RegExp(preSymbol + '\\d+(,\\d{1,3})*(\\.\\d{1,3})*', 'g'), symbol + replacePrice));
            counter += 1;
        }
    });
    if(symbol.indexOf('$') !== -1){symbol = '$:';}
    preSymbol = symbol;
    counter = 0;
}
