/**
 * Listado de instrumentos disponibles para consultar.
 */

var instruments = [
  {'symbol': 'AC*', 'exchange': 'bmv', 'issuer': 'AC', 'serie': '*'},
  {'symbol': 'AC*', 'exchange': 'biva', 'issuer': 'AC', 'serie': '*'},
  {'symbol': 'AC*', 'exchange': 'consol', 'issuer': 'AC', 'serie': '*'},
  {'symbol': 'WALMEX*', 'exchange': 'bmv', 'issuer': 'WALMEX', 'serie': '*'},
  {'symbol': 'WALMEX*', 'exchange': 'biva', 'issuer': 'WALMEX', 'serie': '*'},
  {'symbol': 'WALMEX*', 'exchange': 'consol', 'issuer': 'WALMEX', 'serie': '*'},
  {'symbol': 'CEMEXCPO', 'exchange': 'bmv', 'issuer': 'CEMEX', 'serie': 'CPO'},
  {'symbol': 'CEMEXCPO', 'exchange': 'biva', 'issuer': 'CEMEX', 'serie': 'CPO'},
  {'symbol': 'CEMEXCPO', 'exchange': 'consol', 'issuer': 'CEMEX', 'serie': 'CPO'},
  {'symbol': 'VOLARA', 'exchange': 'bmv', 'issuer': 'VOLAR', 'serie': 'A'},
  {'symbol': 'VOLARA', 'exchange': 'biva', 'issuer': 'VOLAR', 'serie': 'A'},
  {'symbol': 'VOLARA', 'exchange': 'consol', 'issuer': 'VOLAR', 'serie': 'A'},
  {'symbol': 'ALFAA', 'exchange': 'bmv', 'issuer': 'ALFA', 'serie': 'A'},
  {'symbol': 'ALFAA', 'exchange': 'biva', 'issuer': 'ALFA', 'serie': 'A'},
  {'symbol': 'ALFAA', 'exchange': 'consol', 'issuer': 'ALFA', 'serie': 'A'},
  {'symbol': 'FB*', 'exchange': 'bmv', 'issuer': 'AC', 'serie': '*'},
  {'symbol': 'FB*', 'exchange': 'biva', 'issuer': 'AC', 'serie': '*'},
  {'symbol': 'FB*', 'exchange': 'consol', 'issuer': 'AC', 'serie': '*'},
  {'symbol': 'IBM*', 'exchange': 'bmv', 'issuer': 'AC', 'serie': '*'},
  {'symbol': 'IBM*', 'exchange': 'biva', 'issuer': 'AC', 'serie': '*'},
  {'symbol': 'IBM*', 'exchange': 'consol', 'issuer': 'AC', 'serie': '*'},
  {'symbol': 'FUNO11', 'exchange': 'bmv', 'issuer': 'AC', 'serie': '*'},
  {'symbol': 'FUNO11', 'exchange': 'biva', 'issuer': 'AC', 'serie': '*'},
  {'symbol': 'FUNO11', 'exchange': 'consol', 'issuer': 'AC', 'serie': '*'},
  {'symbol': 'AEROMEX*', 'exchange': 'bmv', 'issuer': 'AEROMEX', 'serie': '*'},
  {'symbol': 'AEROMEX*', 'exchange': 'biva', 'issuer': 'AEROMEX', 'serie': '*'},
  {'symbol': 'AEROMEX*', 'exchange': 'consol', 'issuer': 'AEROMEX', 'serie': '*'},
  {'symbol': 'AMXL', 'exchange': 'bmv', 'issuer': 'AMX', 'serie': 'L'},
  {'symbol': 'AMXL', 'exchange': 'biva', 'issuer': 'AMX', 'serie': 'L'},
  {'symbol': 'AMXL', 'exchange': 'consol', 'issuer': 'AMX', 'serie': 'L'},
];


/**
 * 
 * Variables de la emisora seleccionada.
 * 
 */

var websocket_detail = null;
var symbol_detail = null
var exchange_detail = null
var emisora_detail = null
var serie_detail = null

var depthApiInterval = null

$(document).on('hidden.bs.modal', function (e) {

    // Remover los datos que existen en modal.
    $(e.target).removeData('bs.modal');
    // Cerrar conexión con websocket

    if( websocket_detail != null )
    {
        console.log("Se cierra conexión con websocket")
        websocket_detail.close()
    }

    if( depthApiInterval != null )
    {
        clearInterval(depthApiInterval)
    }

});

$(document).on('shown.bs.modal', function (e) {
    $(".symbol").text(symbol_detail)
    $(".exchange").text(exchange_detail)
});

$(document).on('click', '#watchlist a', function(){


  symbol_detail = $(this).data("symbol")
  exchange_detail = $(this).data("exchange")
  emisora_detail = $(this).data("emisora")
  serie_detail = $(this).data("serie")

  console.log([
    symbol_detail,
    exchange_detail
  ])

})

$(document).on('click', '#contenido a',function (e){

    if( websocket_detail != null )
    {
        console.log("Se cierra conexión con websocket")
        websocket_detail.close()
    }

    if( depthApiInterval != null )
    {
        clearInterval(depthApiInterval)
    }

    /**
      * Funcion para realizar la conexión por medio de websocket pasando comoparametros la emisora y la bolsa.
      * ('CEMEXCPO', 'BMV')
      */

    var contenidoId = $(this).attr("href")

    if(contenidoId == "#ultimo-hecho") last(symbol_detail, exchange_detail)
    if(contenidoId == "#intradia") intraday(symbol_detail, exchange_detail, emisora_detail, serie_detail)
    if(contenidoId == "#cierres") close(symbol_detail, exchange_detail, emisora_detail, serie_detail)
    if(contenidoId == "#mejor-postura") bidAsk(symbol_detail, exchange_detail)
    if(contenidoId == "#profundidad-posturas")
    {

      apiDepth(symbol_detail, exchange_detail, emisora_detail, serie_detail)
      
      depthApiInterval = setInterval(function () {
        apiDepth(symbol_detail, exchange_detail, emisora_detail, serie_detail)
      }, 5000);

      depth(symbol_detail, exchange_detail)

    } 
    // if(contenidoId == "#profundidad-posturas") depth(symbol_detail, exchange_detail)

})

/**
 * 
 * JQuery document ready.
 * 
 */

$(document).ready(function(){

  createListInstrument(instruments)

  $("#descargarCSV").on("click", descargarCSV)

});

/**
 * 
 * Descarga de archivo CSV.
 * Estos datos se extraen de la base de datos IndexedDB.
 * 
 */

function descargarCSV()
{
  db.watchlist.toArray(function(watchlist){

    if(watchlist.length == 0) alert("¡No se encontraron registros en la base de datos!")

    console.log("[descargar.csv] ")

    var fileName = moment().format("YYYYMMDD HHmmss - ") + $.ua.get().replace(/[^a-zA-Z 0-9.]+/g,' ')

    var csv = Papa.unparse(watchlist, {
      header: true,
    })

    var csvData = new Blob([csv], {type: 'text/csv;charset=utf-8;'});

    var csvURL =  null;
    
    if (navigator.msSaveBlob)
    {
        csvURL = navigator.msSaveBlob(csvData, fileName + '.csv');
    }
    else
    {
        csvURL = window.URL.createObjectURL(csvData);
    }

    var tempLink = document.createElement('a');
    tempLink.href = csvURL;
    tempLink.setAttribute('download', fileName + '.csv');
    tempLink.click();



  })
}

/**
 * 
 * Crea lista de instrumentos.
 * Muestra en el front una fila por cada instrumento.
 * Tambien manda a llamar el websocket correspondiente a dicho instrumento.
 * 
 */

function createListInstrument(instruments)
{
  /** 
   * Iteración de los intrumetnos para la creación de las instancias de websockets
   */

  $.each(instruments, function(key, instrument){

    /**
     * Crea instancia por medio de una funcion.
     */
    createWebsocket(key, instrument);

    /**
     * Crea la fila en en watchlist
     */

    var symbolID = (instrument.symbol +'-'+ instrument.exchange).replace("*","").toLowerCase();

    var tbody_row = ''
    tbody_row += '<tr class="instrument-'+ symbolID +'">'
    tbody_row += '  <th scope="row"><a href="/detalle.html?symbol='+ instrument.symbol + '&exchange=' + instrument.exchange +'" data-toggle="modal" data-target="#modal" data-symbol="'+ instrument.symbol +'" data-exchange="' + instrument.exchange + '"  data-emisora="' + instrument.issuer + '"  data-serie="' + instrument.serie + '">'+ instrument.symbol +'.'+ instrument.exchange +'</a></th>'
    tbody_row += '  <td class="precio text-right">--</td>'
    tbody_row += '  <td class="volumen text-right">--</td>'
    tbody_row += '  <td class="ppp text-right">--</td>'
    tbody_row += '  <td class="variacion-unitaria text-right">---</td>'
    tbody_row += '  <td class="variacion-porcentual text-right">---</td>'
    tbody_row += '  <td class="apertura text-right">---</td>'
    tbody_row += '  <td class="cierre text-right">---</td>'
    tbody_row += '  <td class="maximo text-right">---</td>'
    tbody_row += '  <td class="minimo text-right">---</td>'
    tbody_row += '  <td class="total-volumen text-right">---</td>'
    tbody_row += '  <td class="total-operaciones text-right">---</td>'
    tbody_row += '  <td class="total-importe text-right">---</td>'
    tbody_row += '  <td class="hora">---</td>'
    tbody_row += '  <td class="estatus text-center">---</td>'
    tbody_row += '  <td class="ticks text-center">---</td>'
    tbody_row += '  <td class="recon text-center">0</td>'
    tbody_row += '</tr>'

    $('table tbody').append(tbody_row)

  })

}

/**
 * 
 * Listado de instancias para la conexión de websockets que se inicializa vacia.
 * 
 */
var listWebsockets = [];

function createWebsocket(key, instrument)
{

  var symbolID = (instrument.symbol +'-'+ instrument.exchange).replace("*","").toLowerCase();

  var ticks = 0

  /**
   * Url para la solicitud de LAST.
   */
  var url = "ws://infodata-qa.infosel-digitalfactory.com/hechos/last/"+ instrument.exchange +"/?simbolo=" + instrument.symbol;

  /**
   * Agregar instancia de websocket al listado.
   */
  listWebsockets[key] = new WebSocket(url)


  /**
   * Conexión de websocket abierta
   */
  listWebsockets[key].onopen = function()
  {
    console.log("[websocket.onopen] " + instrument.symbol + "." + instrument.exchange )
    $('.instrument-' + symbolID + ' .estatus').text('open')
    $('.instrument-' + symbolID + ' .estatus').removeClass("warning").addClass('success')
    saveDB("open", instrument)
  }

  /**
   * Conexión de websocket cerrada
   */
  listWebsockets[key].onclose = function()
  {
    console.log("[websocket.onclose] " + instrument.symbol + "." + instrument.exchange)

    $('.instrument-' + symbolID + ' .estatus').text('close')
    $('.instrument-' + symbolID + ' .estatus').removeClass('success').addClass('danger')

    setTimeout(function(){
      $('.instrument-' + symbolID + ' .estatus').text('con')
      $('.instrument-' + symbolID + ' .estatus').removeClass('danger').addClass('warning')
    }, 3000)

    setTimeout(function(){

      var recon = parseInt($('.instrument-' + symbolID + ' .recon').text()) + 1
      $('.instrument-' + symbolID + ' .recon').text(recon).addClass('danger')

      console.log("[websocket.reconect] " + instrument.symbol + "." + instrument.exchange )
      createWebsocket(key, instrument);

    }, 6000)

    saveDB("close", instrument)

  }

  /**
   * Conexión de websocket error
   */
  listWebsockets[key].onerror = function(event)
  {
    console.log("[websocket.onerror] " + instrument.symbol + "." + instrument.exchange + ' ' + JSON.stringify(event) )
    saveDB("error", instrument)
  }

  /**
   * Conexión de websocket mensaje
   */
  listWebsockets[key].onmessage = function(response)
  {
    
    var last = JSON.parse(response.data).message

    console.log("[websocket.onmessage] " + instrument.symbol + "." + instrument.exchange + " - payload.last: " +  JSON.stringify(last) )

    $('.instrument-' + symbolID + ' .precio').text("$"+last.valueLast.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString())
    $('.instrument-' + symbolID + ' .volumen').text(last.volumeLast.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString())
    $('.instrument-' + symbolID + ' .ppp').text(last.valuePpp)
    $('.instrument-' + symbolID + ' .variacion-unitaria').text(last.change.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString())
    $('.instrument-' + symbolID + ' .variacion-porcentual').text(last.changePercent.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString())
    $('.instrument-' + symbolID + ' .apertura').text("$"+last.valueOpen.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString())
    $('.instrument-' + symbolID + ' .cierre').text("$"+last.valueClose.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString())
    $('.instrument-' + symbolID + ' .maximo').text("$"+last.valueMax.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString())
    $('.instrument-' + symbolID + ' .minimo').text("$"+last.valueMin.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString())
    $('.instrument-' + symbolID + ' .total-volumen').text(last.totalVolume.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString())
    $('.instrument-' + symbolID + ' .total-operaciones').text(last.totalOperations.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString())
    $('.instrument-' + symbolID + ' .total-importe').text("$"+last.totalAmount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString())
    $('.instrument-' + symbolID + ' .hora').text(moment(last.timestamp).format("HH:mm:ss"))
    $('.instrument-' + symbolID + ' .ticks').text(++ticks)


    $('.instrument-' + symbolID).addClass('success')

    setTimeout(function(){
      $('.instrument-' + symbolID).removeClass('success')
    }, 1200)


    var exchangesList = {
      '1':'BMV',
      '2':'BIVA',
      '3':'CONSOL',
    }

    last.exchange = exchangesList[last.exchange]

    saveDB("tick", last)

  }

} 

/**
 * 
 * Guada en base detos el evento correspondiente al instrumento.
 * Etentos:
 *  - Open: Crea una conexión websocket.
 *  - Close: Cierra una conexión websocket.
 *  - Tick: Se recibe un hecho del instrumento.
 * 
 */

function saveDB(type = null, instrument = null)
{

    var event_date = moment()
    var trade_date = moment(instrument.timestamp)

  db.watchlist.add({
    event: type,
    event_date: event_date.format("YYYY-MM-DD"),
    event_hour: event_date.format("HH:mm:ss"),
    infosel_code: instrument.symbol + '.' + instrument.exchange.toUpperCase(),
    symbol: instrument.symbol,
    exchange: instrument.exchange.toUpperCase(),
    trade_number: "---",
    trade_date: trade_date.format("YYYY-MM-DD"),
    trade_hour: trade_date.format("HH:mm:ss"),
    //diff_hours: moment.duration(event_date.diff(trade_date)).as('hours'),
    //diff_minutes: moment.duration(event_date.diff(trade_date)).as('minutes'),
    diff_seconds: moment.duration(event_date.diff(trade_date)).as('seconds'),
    //diff_milliseconds: moment.duration(event_date.diff(trade_date)).as('milliseconds'),
  })
}


// **********************************************************************************

/**
 * 
 * Websockets para el detalle.
 * 
 */

/**
 * 
 * Funciones para solicitar informacion con websocket y API
 * 
 * */

function last(simbolo = null, exchange = null)
{

    // Conexion Websocket
    websocket_detail = new WebSocket("ws://infodata-qa.infosel-digitalfactory.com/hechos/last/"+ exchange.toLowerCase() +"/?simbolo=" + simbolo);

    // Conexión abierta
    websocket_detail.onopen = function()
    {
      console.log("Websocket 'LAST' esta abierta!");
    }

    websocket_detail.onerror = function(event)
    {
      console.error("Error en el WebSocket detectado:", event);
    };

    websocket_detail.onclose = function()
    {
      //last(simbolo, exchange);
    }

    // Recibiendo mensaje
    websocket_detail.onmessage = function(response){

        var dataResponse = JSON.parse(response.data).message;

        console.log(dataResponse);

        var fecha = moment(dataResponse.timestamp)

        $('#ultimo-hecho-fecha').text(fecha.format("YYYY-MM-DD"))
        $('#ultimo-hecho-hora').text(fecha.format("HH:mm:ss"))
        $('#ultimo-hecho-valor').text("$" + dataResponse.valueLast.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString())
        $('#ultimo-hecho-ppp').text("$" + dataResponse.valuePpp.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString())
        $('#ultimo-hecho-variacion').text(dataResponse.change.toFixed(3).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString())
        $('#ultimo-hecho-variacion-porcentual').text(dataResponse.changePercent.toFixed(3).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString()+"%")
        $('#ultimo-hecho-apertura').text("$" + dataResponse.valueOpen.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString())
        $('#ultimo-hecho-cierre').text("$" + dataResponse.valueClose.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString())
        $('#ultimo-hecho-max').text("$" + dataResponse.valueMax.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString())
        $('#ultimo-hecho-min').text("$" + dataResponse.valueMin.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString())
        $('#ultimo-hecho-total-operaciones').text(dataResponse.totalOperations.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString())
        $('#ultimo-hecho-total-volumen').text(dataResponse.totalVolume.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString())
        $('#ultimo-hecho-total-importe').text("$" + dataResponse.totalAmount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString())
        $('#ultimo-hecho-ultimo-valor').text("$" + dataResponse.valueLast.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString())
        $('#ultimo-hecho-ultimo-volumen').text(dataResponse.volumeLast.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString())
        $('#ultimo-hecho-ultimo-importe').text("$" + dataResponse.amountLast.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString())

    }

}

/**
*
* @param simbolo
* @param exchange
*/
function intraday(simbolo = null, exchange = null, emisora = null, serie = null)
{

    $('#intradia-items').empty()

    // Conexion Websocket
    websocket_detail = new WebSocket("ws://infodata-qa.infosel-digitalfactory.com/hechos/intradia/"+ exchange.toLowerCase() +"/?simbolo=" + simbolo);

    // Conexión abierta
    websocket_detail.onopen = function(){
        console.log("Websocket 'INTRADAY' esta abierta!");
    }

    websocket_detail.onerror = function(event) {
        console.error("Error en el WebSocket detectado:", event);
    };

    // Recibiendo mensaje
    websocket_detail.onmessage = function(response){

        var dataResponse = JSON.parse(response.data).message;

        console.log(dataResponse);

        var fecha = moment(dataResponse.tradeTime)

        $('#intradia-fecha').text(fecha.format("YYYY-MM-DD"))
        $('#intradia-hora').text(fecha.format("HH:mm:ss"))

        var html = ''
        html += '<tr>'
        html += '  <td class="col-sm-2 text-right">'+ fecha.format("HH:mm:ss") +'</td>'
        html += '  <td class="col-sm-2 text-right">$'+ dataResponse.valueLast.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString() +'</td>'
        html += '  <td class="col-sm-2 text-right">'+ dataResponse.volumeLast.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString() +'</td>'
        html += '  <td class="col-sm-2 text-right">$'+ dataResponse.amountLast.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString() +'</td>'
        html += '  <td class="col-sm-2 text-right">'+ dataResponse.buy +'</td>'
        html += '  <td class="col-sm-2 text-right">'+ dataResponse.sell +'</td>'
        html += '</tr>'

        // console.log(html)

        $('#intradia-items').prepend(html)

    }

    /**
     * 
     * Historia API
     * 
     */

    var url = "https://facts-qa.infosel-digitalfactory.com/api/v1/find/intraday/?pageSize=100&pageNumber=1&exchange="+ exchange +"&issuer="+ emisora +"&series="+ serie +"&date=2021-01-26"
    
    $.getJSON(url)
    .done(function(data)
    {
      console.log([
        "Intraday - API",
        data
      ])

      var intradayAPI = data.payload
      
      $.each(intradayAPI, function(i, item)
      {

        var html = ''
        html += '<tr>'
        html += '  <td class="col-sm-2 text-right">'+ item.format("HH:MM") +'</td>'
        html += '  <td class="col-sm-2 text-right">$'+ item.valueLast.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString() +'</td>'
        html += '  <td class="col-sm-2 text-right">'+ item.volumeLast.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString() +'</td>'
        html += '  <td class="col-sm-2 text-right">$'+ item.amountLast.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString() +'</td>'
        html += '  <td class="col-sm-2 text-right">'+ item.buy +'</td>'
        html += '  <td class="col-sm-2 text-right">'+ item.sell +'</td>'
        html += '</tr>'

        // console.log(html)

        $('#intradia-items').append(html)

      })

    })

}

function close(simbolo = null, exchange = null, emisora = null, serie = null)
{

  var exchange = exchange == 'bmv' ? 1 : 2 

    $('#cierres-items').empty()

    console.log("Cierres")

    var url = "";

    $.getJSON("https://facts-qa.infosel-digitalfactory.com/api/v1/find/closureinstrum/?pageSize=100&pageNumber=1&exchange="+ exchange +"&issuer="+ emisora +"&series="+ serie +"&dateStart=2020-12-11&dateEnd=2021-01-30")
    .done(function(data) {

      console.log(data.payload)

        $.each(data.payload, function(i, item){

            var html = ''
            html += '<div class="item">'
            html += '    <div class="col-sm-3">'
            html += '        <p>'+ item.misDate.year + '-' + item.misDate.month + '-' + item.misDate.day + '</p>'
            html += '    </div>'
            html += '    <div class="col-sm-1">'
            html += '        <p>'+ item.close +'</p>'
            html += '    </div>'
            html += '    <div class="col-sm-1">'
            html += '        <p>'+ item.open +'</p>'
            html += '    </div>'
            html += '    <div class="col-sm-1">'
            html += '        <p>'+ item.maximum +'</p>'
            html += '    </div>'
            html += '    <div class="col-sm-1">'
            html += '        <p>'+ item.minimum +'</p>'
            html += '    </div>'
            html += '    <div class="col-sm-2">'
            html += '        <p>'+ item.volume +'</p>'
            html += '    </div>'
            html += '    <div class="col-sm-2">'
            html += '        <p>'+ item.amount +'</p>'
            html += '    </div>'
            html += '</div>'

            var html = ''
            html += '<tr>'
            html += '  <td class="text-right">'+ item.misDate.year + '-' + item.misDate.month + '-' + item.misDate.day + '</td>'
            html += '  <td class="text-right">$'+ item.close.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString() +'</td>'
            html += '  <td class="text-right">$'+ item.open.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString() +'</td>'
            html += '  <td class="text-right">$'+ item.maximum.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString() +'</td>'
            html += '  <td class="text-right">$'+ item.minimum.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString() +'</td>'
            html += '  <td class="text-right">'+ item.volume.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString() +'</td>'
            html += '  <td class="text-right">$'+ item.amount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString() +'</td>'

            html += '</tr>'

            $('#cierres-items').prepend(html)

        })
    })

}


function bidAsk(simbolo = null, exchange = null)
{

    // Conexion Websocket
    websocket_detail = new WebSocket("ws://infodata-qa.infosel-digitalfactory.com/posturas/mejor/"+ exchange +"/?simbolo=" + simbolo);

    // Conexión abierta
    websocket_detail.onopen = function(){
        console.log("Websocket 'BidAsk' esta abierta!");
    }

    websocket_detail.onerror = function(event) {
        console.error("Error en el WebSocket detectado:", event);
    };

    websocket_detail.onclose = function(){
        console.log("Websocket 'LAST' esta cerrada!");
    }

    // Recibiendo mensaje
    websocket_detail.onmessage = function(response){

        var dataResponse = JSON.parse(response.data).message;

        // Actualmente no marca error pero al relizar el formateo de la fecha debe ser en timestamp.

        console.log(dataResponse);

        var fecha = moment(dataResponse.tradeTime)

        if(dataResponse.side == 0){
          $('#mejor-postura-compra-fecha').text(fecha.format("YYYY-MM-DD"))
          $('#mejor-postura-compra-hora').text(fecha.format("HH:mm:ss"))
          $('#mejor-postura-compra-precio').text(dataResponse.value)
          $('#mejor-postura-compra-volumen').text(dataResponse.volume)
        } else {
          $('#mejor-postura-venta-fecha').text(fecha.format("YYYY-MM-DD"))
          $('#mejor-postura-venta-hora').text(fecha.format("HH:mm:ss"))
          $('#mejor-postura-venta-precio').text(dataResponse.value)
          $('#mejor-postura-venta-volumen').text(dataResponse.volume)
        }

    }

}


function apiDepth(simbolo = null, exchange = null, emisora = null, serie = null)
{

  var exchange = exchange == 'bmv' ? 1 : 2 

  var url = "https://facts-qa.infosel-digitalfactory.com/api/v1/find/profpostura/?issuer="+ emisora +"&series="+ serie +"&exchange="+ exchange +"&pageNumber=1&pageSize=1&date=2021-01-26"

  $('#profundidad > tr td').text("---")

  $.getJSON(url)
    .done(function(data)
    {
      
      console.log(data)
      
      console.log( data.payload.timestamp )
      console.log( moment(data.payload.timestamp) )

      var fecha = moment(data.payload.timestamp).format("YYYY-MM-DD")
      var hora = moment(data.payload.timestamp).format("HH:mm")

      var bid = data.payload.bid
      var ask = data.payload.ask

      if(bid == null || ask == null) return;

      $("#profundidad-fecha").text(fecha)
      $("#profundidad-hora").text(hora)

      $.each(bid, function(i, item){

        console.log([
          i, item
        ])

        ++i

        $('#profundidad > tr:nth-child('+ i +') td:nth-child(1)').text(item.bidOrders)
        $('#profundidad > tr:nth-child('+ i +') td:nth-child(2)').text(item.bidValume)
        $('#profundidad > tr:nth-child('+ i +') td:nth-child(3)').text('$' + item.bidValue.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString())

      })

      $.each(ask, function(i, item){

        console.log([
          i, item
        ])

        ++i

        $('#profundidad > tr:nth-child('+ i +') td:nth-child(4)').text('$' + item.askValue.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString())
        $('#profundidad > tr:nth-child('+ i +') td:nth-child(5)').text(item.askValume)
        $('#profundidad > tr:nth-child('+ i +') td:nth-child(6)').text(item.askOrders)

      })

    })

}

/**
*
* @param simbolo
* @param exchange
*/
function depth(simbolo = null, exchange = null)
{

    // Conexion Websocket
    websocket_detail = new WebSocket("ws://infodata-qa.infosel-digitalfactory.com/posturas/profundidad/"+ exchange.toLowerCase() +"/?simbolo=" + simbolo);

    // Conexión abierta
    websocket_detail.onopen = function(){
        console.log("Websocket 'DEPTH' esta abierta!");
    }

    websocket_detail.onerror = function(event) {
        console.error("Error en el WebSocket detectado:", event);
    };

    // Recibiendo mensaje
    websocket_detail.onmessage = function(response){

        var dataResponse = JSON.parse(response.data).message;

        console.log(dataResponse);

    }

}
