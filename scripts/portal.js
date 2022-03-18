var select = document.getElementById("selectAno");;
var jsonDeputados;
var jsonPartidos;
var ano = document.getElementById("selectAno").value;
var mes = document.getElementById("selectMes").value;

for(var i = 2020; i >= 2008; i--) {
    var opt = i;
    select.innerHTML += "<option value=\"" + opt + "\">" + opt + "</option>";
}

//Função que separa os conteúdos em abas.
function openContent(evt, conteudo) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" activeTab", "");
    }
    document.getElementById(conteudo).style.display = "block";
    evt.currentTarget.className += " activeTab";
}

//Carrega os dados ao abrir a página
window.onload = function() {
    getDeputados();
    getPartidos();
    openContent(event, 'Deputados');
}

//Função que carrega os dados dos deputados
function getDeputados() {
    let request = new XMLHttpRequest();
    var url = "https://dadosabertos.camara.leg.br/api/v2/deputados?ordem=ASC&ordenarPor=nome";
    request.open("GET", url, true);
    request.setRequestHeader("Accept", "application/json");
    request.onload = function(e) {
        if(request.readyState === 4){
            if(request.status === 200){
                jsonDeputados = request.response;
                geraListaDeputados(request.response);
            } else {
                alert("Erro ao receber os dados: " +request.statusText);
            }
        }
    };
    request.onerror = function(e) {
        alert("Erro: " +request.statusText);
    }
    request.responseType = "json";
    request.send(null);
}

//Função que gera uma lista de deputados.

var campoDeputados = document.getElementById('listaDeputados');

function geraListaDeputados(jsonDeputados) {
    let scriptLista = "";
    for(let i=0; i < jsonDeputados.dados.length; i++) {
        var idDep = jsonDeputados.dados[i].id ;
        scriptLista += "<div><button class='itemDeputado' id='dep" + idDep + "' onClick='geraInfosDeputado("+idDep+")'>" 
        + jsonDeputados.dados[i].id 
        + " | " + jsonDeputados.dados[i].nome + " | " + jsonDeputados.dados[i].siglaPartido + "</button></div>";
    }
    campoDeputados.innerHTML = scriptLista;
}

//Função que define a data.
document.querySelector(".setData").onclick = function() {
    ano = document.getElementById("selectAno").value;
    mes = document.getElementById("selectMes").value;
    
    geraListaDeputados(jsonDeputados);

    alert("Nova data definida.");
}

function geraInfosDeputado(idDeputado) {
    let request = new XMLHttpRequest();
    request.open("GET", "https://dadosabertos.camara.leg.br/api/v2/deputados/" +idDeputado, true);
    request.setRequestHeader("Accept", "application/json");
    request.onload = function(e) {
        if(request.readyState === 4){
            if(request.status === 200){
                var jsonDep = request.response;
                request = new XMLHttpRequest();
                request.open("GET", "https://dadosabertos.camara.leg.br/api/v2/deputados/"+idDeputado+
                "/despesas?ano="+ano+"&mes="+mes+"&ordem=ASC&ordenarPor=ano", true);
                request.setRequestHeader("Accept", "application/json");
                request.onload = function(e) {
                    if(request.readyState === 4){
                        if(request.status === 200){
                            var jsonDespesas = request.response;
                            carregaInfoDeputado(jsonDep, jsonDespesas); 
                        } else {
                            alert("Erro ao receber os dados: " +request.statusText);
                        }
                    }
            };
                request.onerror = function(e) {
                    alert("Erro: " +request.statusText);
                }
                request.responseType = "json";
                request.send(null);
            } else {
                alert("Erro ao receber os dados: " +request.statusText);
            }
        }
};
    request.onerror = function(e) {
        alert("Erro: " +request.statusText);
    }
    request.responseType = "json";
    request.send(null);
}

function carregaInfoDeputado(jsonDep, jsonDespesas){
    var urlFoto = jsonDep.dados.ultimoStatus.urlFoto;
    var nomeCivil = jsonDep.dados.nomeCivil;
    var partido = jsonDep.dados.ultimoStatus.siglaPartido;
    var nomeEleitoral = jsonDep.dados.ultimoStatus.nomeEleitoral;
    var uf = jsonDep.dados.ultimoStatus.siglaUf;

    var card = "<div class='infos'>"+
    "<div class='card'><div class='legendaFoto'><h4><b>"+nomeCivil+
    "</b></h4><p>Nome Eleitoral: "+nomeEleitoral+"<br>Partido: "+partido+"<br>UF: "
    +uf+"</p></div><div class='fotoDeputado'><img src='"+urlFoto+"'></div></div>";

    if(jsonDespesas.dados.length === 0) {
        card += "<div class='tabelaDespesas'>Não foram encontrados registros de despesas para a data selecionada."+
        "</div>"
    } else {
        card += "<div class='tabelaDespesas'><div><table>"+
        "<tr><th>Data</th><th>Valor</th><th>Descrição</th><th>PDF</th></tr>";

        for(var i=0; i<jsonDespesas.dados.length; i++) {
            var data = jsonDespesas.dados[i].dataDocumento;
            data = moment(jsonDespesas.dados[i].dataDocumento).format("DD/MM/YYYY");
            var valor = jsonDespesas.dados[i].valorDocumento;
            var descricao = jsonDespesas.dados[i].tipoDespesa;
            var link = jsonDespesas.dados[i].urlDocumento;

            card += "<tr><td>"+data+"</td><td>"+valor.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'})+
            "</td><td>"+descricao+"</td><td><a href='"+link+"' target='_blank'><div>Link</div></a></td></div></div>";
        }
    }

    card += "</div>";

    campoDeputados.innerHTML = card;
}

//Função que carrega os dados dos partidos.
function getPartidos() {
    let request = new XMLHttpRequest();
    var urlPartidos = "https://dadosabertos.camara.leg.br/api/v2/partidos?ordem=ASC&ordenarPor=sigla";
    request.open("GET", urlPartidos, true);
    request.setRequestHeader("Accept", "application/json");
    request.onload = function(e) {
        if(request.readyState === 4){
            if(request.status === 200){
                jsonPartidos = request.response;
                geraListaPartidos(request.response);
                geraListaFiltroPartidos(request.response);
            } else {
                alert("Erro ao receber os dados: " +request.statusText);
            }
        }
    };
    request.onerror = function(e) {
        alert("Erro: " +request.statusText);
    }
    request.responseType = "json";
    request.send(null);
}

//Função que gera uma lista dos partidos.

var campoPartidos = document.getElementById('listaPartidos');

function geraListaPartidos(jsonPartidos) {
    let scriptLista = "";
    for(let i=0; i<jsonPartidos.dados.length; i++) {
        var idPartido = jsonPartidos.dados[i].id;
        scriptLista += "<div><button class='itemPartido' onClick='geraInfosPartido("+idPartido+")'>" +idPartido + " | " 
        + jsonPartidos.dados[i].sigla + " | " +
        jsonPartidos.dados[i].nome + "</button></div>";
    }

    campoPartidos.innerHTML = scriptLista;
}

//Função pra gerar a request das infos dos partidos;
function geraInfosPartido (idPartido) {
    let request = new XMLHttpRequest();
    request.open("GET", "https://dadosabertos.camara.leg.br/api/v2/partidos/" +idPartido, true);
    request.setRequestHeader("Accept", "application/json");
    request.onload = function(e) {
        if(request.readyState === 4){
            if(request.status === 200){
                var jsonPartido = request.response;
                carregaInfoPartido(jsonPartido);
            } else {
                alert("Erro ao receber os dados: " +request.statusText);
            }
        }
    };
    request.onerror = function(e) {
        alert("Erro: " +request.statusText);
    }
    request.responseType = "json";
    request.send(null);
}

//Função que vai gerar de verdade as infos de cada partido.
function carregaInfoPartido (jsonPartido) {
    document.getElementById("inputFiltroPartido").value = jsonPartido.dados.sigla;
    openContent(event, 'Deputados');
    filtraPorPartido();
}

//Função que pesquisa um deputado pelo nome;
document.getElementById('botaoBuscarDeputado').onclick = function() {
    let request = new XMLHttpRequest();
    var nome = document.getElementById("buscarDep").value;
    var partido = document.getElementById("inputFiltroPartido").value;
    if (partido === "") {
        var urlBusca = "https://dadosabertos.camara.leg.br/api/v2/deputados?nome="+
        nome+ "&ordem=ASC&ordenarPor=nome";
    } else {
        var urlBusca = "https://dadosabertos.camara.leg.br/api/v2/deputados?nome="+nome+"&siglaPartido="
        +partido+ "&ordem=ASC&ordenarPor=nome";
    }
    request.open("GET", urlBusca, true);
    request.setRequestHeader("Accept", "application/json");
    request.onload = function(e) {
        if(request.readyState === 4){
            if(request.status === 200){
                geraListaDeputados(request.response);
            } else {
                alert("Erro ao receber os dados: " +request.statusText);
            }
        }
    };
    request.onerror = function(e) {
        alert("Erro: " +request.statusText);
    }
    request.responseType = "json";
    request.send(null);
}

//Função que simplesmente limpa os filtros
document.querySelector(".botaoLimpar").onclick = function() {
    var inputs = document.getElementsByClassName("inputBusca");
    for(var i = 0; i < inputs.length; i++) {
        inputs[i].value = "";
    }
    geraListaDeputados(jsonDeputados);
    geraListaPartidos(jsonPartidos);
}

//Função que pesquisa um partido pela sigla;
document.getElementById('botaoBuscarPartido').onclick = function() {
    let request = new XMLHttpRequest();
    let urlBusca = "https://dadosabertos.camara.leg.br/api/v2/partidos?sigla="
    +document.getElementById("buscarPartido").value+ "&ordem=ASC&ordenarPor=sigla"
    request.open("GET", urlBusca, true);
    request.setRequestHeader("Accept", "application/json");
    request.onload = function(e) {
        if(request.readyState === 4){
            if(request.status === 200){
                geraListaPartidos(request.response);
            } else {
                alert("Erro ao receber os dados: " +request.statusText);
            }
        }
    };
    request.onerror = function(e) {
        alert("Erro: " +request.statusText);
    }
    request.responseType = "json";
    request.send(null);
}

//Função que gera a lista do filtro de partidos;
function geraListaFiltroPartidos(jsonPartidos) {
    let scriptLista = "";
    var partidos = document.getElementById("partidos");
    for(let i=0; i < jsonPartidos.dados.length; i++){
        scriptLista += "<option value='"+jsonPartidos.dados[i].sigla+"'>";
    }
    partidos.innerHTML = scriptLista;
}

document.getElementById("botaoFiltrarPartido").onclick = function () {
    filtraPorPartido();
}

//Função que filtra os deputados pelo partido selecionado;
function filtraPorPartido() {
    let request = new XMLHttpRequest();
    var partido = document.getElementById("inputFiltroPartido").value;
    var nome = document.getElementById("buscarDep").value;
    if(nome === "") {
        var url = "https://dadosabertos.camara.leg.br/api/v2/deputados?siglaPartido="
        + partido + "&ordem=ASC&ordenarPor=nome";
    } else {
        var url = "https://dadosabertos.camara.leg.br/api/v2/deputados?nome="+ nome + "&siglaPartido="
        + partido + "&ordem=ASC&ordenarPor=nome"
    }
    request.open("GET", url, true);
    request.setRequestHeader("Accept", "application/json");
    request.onload = function(e) {
        if(request.readyState === 4){
            if(request.status === 200){
                geraListaDeputados(request.response);
            } else {
                alert("Erro ao receber os dados: " +request.statusText);
            }
        }
    };
    request.onerror = function(e) {
        alert("Erro: " +request.statusText);
    }
    request.responseType = "json";
    request.send(null);
}



