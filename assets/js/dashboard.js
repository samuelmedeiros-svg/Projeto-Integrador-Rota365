/**
 * dashboard.js
 * Controla toda a navegação SPA (single page application) do sistema:
 *
 * 1) Carrega a sidebar (partials/sidebar.html) dentro de #sidebar-container.
 *    A sidebar existe em UM ÚNICO arquivo (partials/sidebar.html) — nenhum
 *    outro arquivo (nem o indexfuncionario.html, nem os arquivos em /pages)
 *    deve conter a marcação da sidebar. Isso evita o bug de sidebar duplicada.
 *
 * 2) Depois de a sidebar estar na tela, liga o clique dos links do menu.
 *
 * 3) Ao clicar em um item do menu, busca o arquivo correspondente em
 *    /pagesdashboard e substitui apenas o conteúdo de #main-content — a
 *    sidebar nunca recarrega.
 *
 * 4) Depois de injetar o HTML de uma página, executa (se existir) uma
 *    função de inicialização específica daquela página — ver PAGE_INIT.
 *    É assim que páginas com comportamento próprio (filtros, modais,
 *    calendário etc.) ligam seus próprios eventos sem precisar de outro
 *    arquivo .js.
 *
 * Para adicionar uma nova página:
 *   a) Crie o arquivo .html dentro de /pagesdashboard (apenas o conteúdo
 *      interno, sem <html>/<head>/<body> e SEM a sidebar).
 *   b) Adicione uma entrada no objeto ROUTES abaixo.
 *   c) Se a página precisar de JS próprio, crie uma função
 *      "initPagina<Nome>()" mais abaixo neste mesmo arquivo e registre-a
 *      em PAGE_INIT.
 */

(function () {
    "use strict";

    // Registrar plugins do Chart.js para rótulos visuais
    if (typeof Chart !== 'undefined') {
        // Plugin 1: Rótulo com porcentagens dentro de Rosca/Pizza
        Chart.register({
            id: 'percentLabels',
            afterDraw(chart) {
                if (chart.config.type !== 'doughnut' && chart.config.type !== 'pie') return;

                const ctx = chart.ctx;
                const data = chart.data.datasets[0].data;
                const total = data.reduce((a, b) => a + b, 0);

                chart.getDatasetMeta(0).data.forEach((element, index) => {
                    const value = data[index];
                    if (!value) return;
                    const percent = ((value / total) * 100).toFixed(0) + "%";
                    const position = element.tooltipPosition();

                    ctx.fillStyle = "#ffffff";
                    ctx.font = "bold 12px sans-serif";
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.fillText(percent, position.x, position.y);
                });
            }
        });

        // Plugin 2: Valores nos pontos do gráfico de linha
        Chart.register({
            id: 'lineValuePlugin',
            afterDatasetsDraw(chart) {
                if (chart.config.type !== 'line') return;
                const ctx = chart.ctx;
                chart.data.datasets.forEach((dataset, datasetIndex) => {
                    const meta = chart.getDatasetMeta(datasetIndex);
                    meta.data.forEach((element, index) => {
                        const val = dataset.data[index];
                        if (val !== undefined && val !== null) {
                            const formatted = "R$ " + val.toLocaleString('pt-BR');
                            ctx.fillStyle = '#1A1A1A';
                            ctx.font = 'bold 10px sans-serif';
                            ctx.textAlign = 'center';
                            ctx.fillText(formatted, element.x, element.y - 10);
                        }
                    });
                });
            }
        });
    }

    let graficosAtivos = {
        faturamento: null,
        categoria: null,
        frota: null
    };

    function inicializarGraficos(pageKey) {
        // Destruir instâncias existentes para não sobrepor
        Object.keys(graficosAtivos).forEach(key => {
            if (graficosAtivos[key]) {
                graficosAtivos[key].destroy();
                graficosAtivos[key] = null;
            }
        });

        if (typeof Chart === 'undefined') return;

        if (pageKey === 'financeiro') {
            const ctxFaturamento = document.getElementById('graficoFaturamento');
            const ctxCategoria = document.getElementById('graficoCategoria');
            
            if (ctxFaturamento) {
                graficosAtivos.faturamento = new Chart(ctxFaturamento, {
                    type: 'line',
                    data: {
                        labels: ['Abr/26', 'Mai/26', 'Jun/26', 'Jul/26', 'Ago/26', 'Set/26'],
                        datasets: [{
                            label: 'Faturamento (R$)',
                            data: [18800, 19300, 21200, 24700, 27300, 29800],
                            borderColor: '#FF6B00',
                            backgroundColor: 'rgba(255, 107, 0, 0.12)',
                            borderWidth: 3,
                            fill: true,
                            tension: 0.35,
                            pointRadius: 5,
                            pointBackgroundColor: '#FF6B00',
                            pointBorderColor: '#FFFFFF',
                            pointBorderWidth: 2
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        layout: { padding: { top: 20 } },
                        plugins: { legend: { display: false } },
                        scales: {
                            y: {
                                display: true,
                                grid: { color: '#F0F0F0' },
                                ticks: {
                                    callback: function(val) { return 'R$ ' + (val/1000) + 'k'; }
                                }
                            },
                            x: { grid: { display: false } }
                        }
                    }
                });
            }

            if (ctxCategoria) {
                graficosAtivos.categoria = new Chart(ctxCategoria, {
                    type: 'doughnut',
                    data: {
                        labels: ['Sedan', 'Econômico', 'SUV', 'Luxo'],
                        datasets: [{
                            data: [34, 24, 24, 18],
                            backgroundColor: ['#FF6B00', '#3A86FF', '#00A878', '#FFB000'],
                            borderWidth: 3,
                            borderColor: '#FFFFFF'
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        cutout: '70%',
                        plugins: { legend: { display: false } }
                    }
                });
            }
        }

        if (pageKey === 'relatorios') {
            const ctxFrota = document.getElementById('graficoFrota');
            if (ctxFrota) {
                graficosAtivos.frota = new Chart(ctxFrota, {
                    type: 'doughnut',
                    data: {
                        labels: ['Alugados', 'Disponíveis', 'Reservados', 'Manutenção'],
                        datasets: [{
                            data: [55, 20, 15, 10],
                            backgroundColor: ['#FF6B00', '#3A86FF', '#00A878', '#FFB000'],
                            borderWidth: 3,
                            borderColor: '#FFFFFF'
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        cutout: '65%',
                        plugins: { legend: { display: false } }
                    }
                });
            }
        }
    }


    // Mapa central de rotas: chave -> arquivo dentro de /pagesdashboard
    const ROUTES = {
        inicio: "pagesdashboard/inicio.html",
        veiculos: "pagesdashboard/veiculosdashboard.html",
        reservas: "pagesdashboard/reservasdashboard.html",
        clientes: "pagesdashboard/clientesdashboard.html",
        financeiro: "pagesdashboard/financeirodashboard.html",
        relatorios: "pagesdashboard/relatoriosdashboard.html",
    };

    // Mapa de inicializadores específicos de cada página (executados após
    // o HTML da página ser injetado em #main-content).
    const PAGE_INIT = {
        reservas: initPaginaReservas,
        veiculos: initPaginaVeiculos,
        clientes: initPaginaClientes,
    };

    const PAGINA_PADRAO = "inicio";
    const CAMINHO_SIDEBAR = "partials/sidebar.html";

    const mainContent = document.getElementById("main-content");
    const sidebarContainer = document.getElementById("sidebar-container");

    // Cache simples para não buscar o mesmo arquivo várias vezes
    const cachePaginas = {};

    function marcarLinkAtivo(pageKey) {
        const navLinks = sidebarContainer.querySelectorAll("a[data-page]");
        navLinks.forEach((link) => {
            link.classList.toggle("active", link.dataset.page === pageKey);
        });
    }

    async function carregarPagina(pageKey, atualizarHistorico = true) {
        const url = ROUTES[pageKey];

        if (!url) {
            console.warn(`Rota "${pageKey}" não encontrada em ROUTES.`);
            return;
        }

        try {
            let html = cachePaginas[pageKey];

            if (!html) {
                const resposta = await fetch(url);

                if (!resposta.ok) {
                    throw new Error(`Falha ao carregar "${url}" (status ${resposta.status})`);
                }

                html = await resposta.text();
                cachePaginas[pageKey] = html;
            }

            mainContent.innerHTML = html;
            inicializarGraficos(pageKey);
            marcarLinkAtivo(pageKey);

            // Atualiza a URL (hash) sem recarregar a página
            if (atualizarHistorico && window.location.hash !== "#" + pageKey) {
                history.pushState({ pageKey }, "", "#" + pageKey);
            }

            // Executa a inicialização específica da página, se existir
            if (typeof PAGE_INIT[pageKey] === "function") {
                PAGE_INIT[pageKey]();
            }
        } catch (erro) {
            mainContent.innerHTML = `
                <div class="topbar">
                    <div>
                        <h2 class="saudacao">Não foi possível carregar o conteúdo.</h2>
                        <p class="subtitulo">Tente novamente em instantes.</p>
                    </div>
                </div>
            `;
            console.error(erro);
        }
    }

    function configurarCliquesDoMenu() {
        const navLinks = sidebarContainer.querySelectorAll("a[data-page]");
        navLinks.forEach((link) => {
            link.addEventListener("click", (evento) => {
                evento.preventDefault();
                carregarPagina(link.dataset.page);
            });
        });
    }

    async function carregarSidebar() {
        try {
            const resposta = await fetch(CAMINHO_SIDEBAR);

            if (!resposta.ok) {
                throw new Error(`Falha ao carregar "${CAMINHO_SIDEBAR}" (status ${resposta.status})`);
            }

            const html = await resposta.text();
            sidebarContainer.innerHTML = html;
            configurarCliquesDoMenu();
        } catch (erro) {
            console.error(erro);
        }
    }

    window.addEventListener("popstate", () => {
        const paginaPelaUrl = window.location.hash ? window.location.hash.slice(1) : PAGINA_PADRAO;
        carregarPagina(ROUTES[paginaPelaUrl] ? paginaPelaUrl : PAGINA_PADRAO, false);
    });

    async function inicializar() {
        // 1) Carrega a sidebar (e liga os cliques dela)
        await carregarSidebar();

        // 2) Só então carrega o conteúdo inicial (respeitando o hash da URL, se houver)
        const paginaPelaUrl = window.location.hash
            ? window.location.hash.replace("#", "")
            : PAGINA_PADRAO;

        carregarPagina(ROUTES[paginaPelaUrl] ? paginaPelaUrl : PAGINA_PADRAO);
    }

    /* ==================================================================
     * PÁGINA: RESERVAS
     * Toda a lógica abaixo só é executada quando a página "reservas" é
     * carregada em #main-content (ver PAGE_INIT acima). Os dados são
     * mockados em memória — sem backend, conforme solicitado.
     * ================================================================== */

    function initPaginaReservas() {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const ITENS_POR_PAGINA = 5;
        let paginaAtual = 1;
        let mesCalendario = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        let proximoId = 1;

        // ---------- Helpers ----------

        function addDias(base, dias) {
            const d = new Date(base);
            d.setDate(d.getDate() + dias);
            return d;
        }

        function isoData(d) {
            return d.toISOString().split("T")[0];
        }

        function formatarDataBR(d) {
            return d.toLocaleDateString("pt-BR");
        }

        function formatarMoeda(valor) {
            return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
        }

        function diffDias(a, b) {
            return Math.round((b - a) / (1000 * 60 * 60 * 24));
        }

        function novoId() {
            return "RES-" + String(proximoId++).padStart(4, "0");
        }

        function statusLabel(status) {
            const mapa = {
                pendente: "Pendente",
                confirmada: "Confirmada",
                andamento: "Em andamento",
                finalizada: "Finalizada",
                cancelada: "Cancelada",
            };
            return mapa[status] || status;
        }

        function criarReserva(nome, telefone, email, cpf, modelo, marca, ano, placa, categoria, offsetRetirada, offsetDevolucao, diaria, status, retiradaHora = "10:00", devolucaoHora = "10:00") {
            const retirada = addDias(hoje, offsetRetirada);
            const devolucao = addDias(hoje, offsetDevolucao);
            const dias = Math.max(1, diffDias(retirada, devolucao));
            return {
                id: novoId(),
                cliente: { nome, telefone, email, cpf },
                veiculo: { modelo, marca, ano, placa, categoria },
                retirada,
                retiradaHora,
                devolucao,
                devolucaoHora,
                diaria,
                valorTotal: diaria * dias,
                status,
                pagamento: {
                    status: status === "finalizada" ? "Pago" : status === "cancelada" ? "Estornado" : "Pendente",
                    forma: "Cartão de crédito",
                },
                criadoEm: addDias(hoje, offsetRetirada - 2),
            };
        }

        // ---------- Dados mockados (frontend apenas) ----------

        let RESERVAS = [
            // Os 3 registros abaixo são os mesmos exibidos em "Reservas Confirmadas"
            // no inicio.html — mesmo cliente, veículo, horário de retirada e status.
            criarReserva("João Silva", "(34) 99111-2222", "joao.silva@email.com", "111.111.111-11", "HB20", "Hyundai", 2023, "ABC-1D23", "Econômico", 0, 3, 120, "confirmada", "10:00"),
            criarReserva("Maria Souza", "(34) 99222-3333", "maria.souza@email.com", "222.222.222-22", "Corolla", "Toyota", 2024, "DEF-2E34", "Sedan", 0, 4, 180, "confirmada", "11:30"),
            criarReserva("Pedro Oliveira", "(34) 99333-4444", "pedro.oliveira@email.com", "333.333.333-33", "Onix", "Chevrolet", 2022, "GHI-3F45", "Econômico", 1, 4, 110, "confirmada", "14:00"),
            criarReserva("Ana Lima", "(34) 99444-5555", "ana.lima@email.com", "444.444.444-44", "Compass", "Jeep", 2024, "JKL-4G56", "SUV", -3, -1, 260, "finalizada"),
            criarReserva("Carlos Souza", "(34) 99555-6666", "carlos.souza@email.com", "555.555.555-55", "Civic", "Honda", 2023, "MNO-5H67", "Sedan", 0, 2, 190, "pendente"),
            criarReserva("Fernanda Reis", "(34) 99666-7777", "fernanda.reis@email.com", "666.666.666-66", "Kicks", "Nissan", 2023, "PQR-6I78", "SUV", 2, 5, 210, "confirmada"),
            criarReserva("Lucas Martins", "(34) 99777-8888", "lucas.martins@email.com", "777.777.777-77", "Argo", "Fiat", 2022, "STU-7J89", "Econômico", -2, 0, 100, "andamento"),
            criarReserva("Beatriz Alves", "(34) 99888-9999", "beatriz.alves@email.com", "888.888.888-88", "Renegade", "Jeep", 2024, "VWX-8K90", "SUV", 3, 6, 250, "pendente"),
            criarReserva("Rafael Costa", "(34) 99999-0000", "rafael.costa@email.com", "999.999.999-99", "Corolla", "Toyota", 2024, "DEF-2E34", "Sedan", 4, 7, 180, "pendente"),
            criarReserva("Juliana Dias", "(34) 98111-1111", "juliana.dias@email.com", "101.101.101-01", "HB20", "Hyundai", 2023, "ABC-1D23", "Econômico", 5, 8, 120, "confirmada"),
            criarReserva("Marcos Rocha", "(34) 98222-2222", "marcos.rocha@email.com", "202.202.202-02", "Onix", "Chevrolet", 2022, "GHI-3F45", "Econômico", -5, -3, 110, "cancelada"),
            criarReserva("Patrícia Nunes", "(34) 98333-3333", "patricia.nunes@email.com", "303.303.303-03", "Civic", "Honda", 2023, "MNO-5H67", "Sedan", -4, -2, 190, "finalizada"),
        ];

        // ---------- Elementos do DOM (existem só enquanto esta página está aberta) ----------

        const tbodyEl = document.getElementById("reservas-tbody");
        const tabelaHojeEl = document.getElementById("reservas-hoje-tbody");
        const paginacaoEl = document.getElementById("reservas-paginacao");
        const alertasEl = document.getElementById("reservas-alertas");
        const calendarioGridEl = document.getElementById("calendario-grid");
        const calendarioTituloEl = document.getElementById("calendario-mes-atual");
        const calendarioAnteriorBtn = document.getElementById("calendario-mes-anterior");
        const calendarioProximoBtn = document.getElementById("calendario-mes-proximo");

        const filtroCliente = document.getElementById("filtro-cliente");
        const filtroVeiculo = document.getElementById("filtro-veiculo");
        const filtroStatus = document.getElementById("filtro-status");
        const filtroCategoria = document.getElementById("filtro-categoria");
        const filtroRetirada = document.getElementById("filtro-retirada");
        const filtroDevolucao = document.getElementById("filtro-devolucao");
        const btnFiltrar = document.getElementById("btn-filtrar");
        const btnLimparFiltros = document.getElementById("btn-limpar-filtros");

        const modalEl = document.getElementById("modal-reserva");
        const modalCorpoEl = document.getElementById("modal-corpo");
        const modalFecharBtn = document.getElementById("modal-fechar");

        const btnNovaReserva = document.getElementById("btn-nova-reserva");
        const modalNovaReservaEl = document.getElementById("modal-nova-reserva");
        const novaReservaFecharBtn = document.getElementById("nova-reserva-fechar");
        const novaReservaCancelarBtn = document.getElementById("nova-reserva-cancelar");
        const formNovaReserva = document.getElementById("form-nova-reserva");

        if (!tbodyEl) {
            // Segurança: se por algum motivo os elementos não existirem, não faz nada.
            return;
        }

        // ---------- Filtros ----------

        function obterReservasFiltradas() {
            const cliente = filtroCliente.value.trim().toLowerCase();
            const veiculo = filtroVeiculo.value.trim().toLowerCase();
            const status = filtroStatus.value;
            const categoria = filtroCategoria.value;
            const retiradaFiltro = filtroRetirada.value;
            const devolucaoFiltro = filtroDevolucao.value;

            return RESERVAS.filter((r) => {
                if (cliente && !r.cliente.nome.toLowerCase().includes(cliente)) return false;
                if (veiculo && !(r.veiculo.modelo.toLowerCase().includes(veiculo) || r.veiculo.placa.toLowerCase().includes(veiculo))) return false;
                if (status && r.status !== status) return false;
                if (categoria && r.veiculo.categoria !== categoria) return false;
                if (retiradaFiltro && isoData(r.retirada) !== retiradaFiltro) return false;
                if (devolucaoFiltro && isoData(r.devolucao) !== devolucaoFiltro) return false;
                return true;
            });
        }

        // ---------- Cards de resumo ----------

        function renderizarCards() {
            document.getElementById("card-hoje").textContent = RESERVAS.filter((r) => isoData(r.retirada) === isoData(hoje)).length;
            document.getElementById("card-pendentes").textContent = RESERVAS.filter((r) => r.status === "pendente").length;
            document.getElementById("card-confirmadas").textContent = RESERVAS.filter((r) => r.status === "confirmada").length;
            document.getElementById("card-andamento").textContent = RESERVAS.filter((r) => r.status === "andamento").length;
            document.getElementById("card-finalizadas").textContent = RESERVAS.filter((r) => r.status === "finalizada").length;
            document.getElementById("card-canceladas").textContent = RESERVAS.filter((r) => r.status === "cancelada").length;

            const emUmaSemana = addDias(hoje, 7);

            document.getElementById("card-dev-hoje").textContent = RESERVAS.filter(
                (r) => isoData(r.devolucao) === isoData(hoje) && r.status !== "cancelada"
            ).length;
            document.getElementById("card-dev-atrasadas").textContent = RESERVAS.filter(
                (r) => r.status === "andamento" && r.devolucao < hoje
            ).length;
            document.getElementById("card-dev-semana").textContent = RESERVAS.filter(
                (r) => r.devolucao >= hoje && r.devolucao <= emUmaSemana && r.status !== "cancelada" && r.status !== "finalizada"
            ).length;
            document.getElementById("card-dev-realizadas").textContent = RESERVAS.filter((r) => r.status === "finalizada").length;
        }

        // ---------- Retiradas e devoluções de hoje ----------

        function renderizarTabelaHoje() {
            const hojeIso = isoData(hoje);
            const linhas = [];

            RESERVAS.forEach((r) => {
                if (isoData(r.retirada) === hojeIso) {
                    linhas.push({ r, tipo: "retirada", horario: r.retiradaHora });
                }
                if (isoData(r.devolucao) === hojeIso) {
                    linhas.push({ r, tipo: "devolucao", horario: r.devolucaoHora });
                }
            });

            linhas.sort((a, b) => a.horario.localeCompare(b.horario));

            tabelaHojeEl.innerHTML = linhas.length
                ? linhas
                      .map(
                          ({ r, tipo, horario }) => `
                <tr>
                    <td class="cliente-nome">${r.cliente.nome}</td>
                    <td>${r.veiculo.modelo}</td>
                    <td><span class="veiculo-badge">${r.veiculo.placa}</span></td>
                    <td><span class="tipo-badge tipo-${tipo}">${tipo === "retirada" ? "Retirada" : "Devolução"}</span></td>
                    <td>${horario}</td>
                    <td><span class="status-badge status-${r.status}">${statusLabel(r.status)}</span></td>
                </tr>
            `
                      )
                      .join("")
                : `<tr><td colspan="6" style="text-align:center; padding: 20px; color: var(--cinza);">Nenhuma retirada ou devolução hoje.</td></tr>`;
        }

        // ---------- Alertas ----------

        function renderizarAlertas() {
            const alertas = [];

            RESERVAS.forEach((r) => {
                if (r.status === "andamento" && r.devolucao < hoje) {
                    alertas.push({
                        tipo: "atraso",
                        titulo: `Reserva atrasada — ${r.cliente.nome}`,
                        descricao: `Devolução prevista para ${formatarDataBR(r.devolucao)}`,
                    });
                }
                if (r.status === "cancelada") {
                    alertas.push({
                        tipo: "cancelada",
                        titulo: `Reserva cancelada — ${r.cliente.nome}`,
                        descricao: `${r.veiculo.modelo} (${r.veiculo.placa})`,
                    });
                }
            });

            const ativos = RESERVAS.filter((r) => r.status !== "cancelada" && r.status !== "finalizada");
            for (let i = 0; i < ativos.length; i++) {
                for (let j = i + 1; j < ativos.length; j++) {
                    if (ativos[i].veiculo.placa === ativos[j].veiculo.placa) {
                        const sobrepoe = ativos[i].retirada <= ativos[j].devolucao && ativos[j].retirada <= ativos[i].devolucao;
                        if (sobrepoe) {
                            alertas.push({
                                tipo: "conflito",
                                titulo: `Conflito de datas — ${ativos[i].veiculo.placa}`,
                                descricao: `${ativos[i].cliente.nome} e ${ativos[j].cliente.nome} disputam o mesmo veículo`,
                            });
                        }
                    }
                }
            }

            alertas.push({
                tipo: "indisponivel",
                titulo: "Veículo indisponível",
                descricao: "Onix (GHI-3F45) em manutenção — reservas futuras podem ser afetadas",
            });

            const mapaClasse = {
                hoje: "",
                atraso: "alerta-atraso",
                conflito: "alerta-conflito",
                indisponivel: "alerta-indisponivel",
                cancelada: "alerta-cancelada",
            };

            alertasEl.innerHTML = alertas
                .map(
                    (a) => `
                <div class="alerta-reserva ${mapaClasse[a.tipo] || ""}">
                    <div>
                        <strong>${a.titulo}</strong>
                        <span>${a.descricao}</span>
                    </div>
                </div>
            `
                )
                .join("");
        }

        // ---------- Ações da tabela ----------

        function renderizarAcoes(r) {
            let botoes = `
                <button type="button" class="btn-acao acao-ver" data-action="ver" data-id="${r.id}">Visualizar</button>
                <button type="button" class="btn-acao" data-action="editar" data-id="${r.id}">Editar</button>
            `;

            if (r.status === "pendente") {
                botoes += `
                    <button type="button" class="btn-acao acao-confirmar" data-action="confirmar" data-id="${r.id}">Confirmar</button>
                    <button type="button" class="btn-acao acao-cancelar" data-action="cancelar" data-id="${r.id}">Cancelar</button>
                `;
            } else if (r.status === "confirmada") {
                botoes += `
                    <button type="button" class="btn-acao acao-iniciar" data-action="iniciar" data-id="${r.id}">Iniciar locação</button>
                    <button type="button" class="btn-acao acao-cancelar" data-action="cancelar" data-id="${r.id}">Cancelar</button>
                `;
            } else if (r.status === "andamento") {
                botoes += `<button type="button" class="btn-acao acao-finalizar" data-action="finalizar" data-id="${r.id}">Finalizar locação</button>`;
            }

            return botoes;
        }

        // ---------- Tabela + paginação ----------

        function renderizarTabela() {
            const filtradas = obterReservasFiltradas();
            const totalPaginas = Math.max(1, Math.ceil(filtradas.length / ITENS_POR_PAGINA));

            if (paginaAtual > totalPaginas) paginaAtual = totalPaginas;
            if (paginaAtual < 1) paginaAtual = 1;

            const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
            const pagina = filtradas.slice(inicio, inicio + ITENS_POR_PAGINA);

            tbodyEl.innerHTML = pagina.length
                ? pagina
                      .map(
                          (r) => `
                <tr>
                    <td class="cliente-nome">${r.id}</td>
                    <td>${r.cliente.nome}</td>
                    <td>${r.veiculo.modelo}</td>
                    <td><span class="veiculo-badge">${r.veiculo.placa}</span></td>
                    <td>${formatarDataBR(r.retirada)}</td>
                    <td>${formatarDataBR(r.devolucao)}</td>
                    <td>${formatarMoeda(r.valorTotal)}</td>
                    <td><span class="status-badge status-${r.status}">${statusLabel(r.status)}</span></td>
                    <td><div class="acoes-cell">${renderizarAcoes(r)}</div></td>
                </tr>
            `
                      )
                      .join("")
                : `<tr><td colspan="9" style="text-align:center; padding: 24px; color: var(--cinza);">Nenhuma reserva encontrada.</td></tr>`;

            renderizarPaginacao(totalPaginas);
        }

        function renderizarPaginacao(totalPaginas) {
            let html = `<button type="button" data-pagina="anterior" ${paginaAtual === 1 ? "disabled" : ""}>Anterior</button>`;

            for (let i = 1; i <= totalPaginas; i++) {
                html += `<button type="button" data-pagina="${i}" class="${i === paginaAtual ? "ativo" : ""}">${i}</button>`;
            }

            html += `<button type="button" data-pagina="proximo" ${paginaAtual === totalPaginas ? "disabled" : ""}>Próximo</button>`;
            paginacaoEl.innerHTML = html;
        }

        paginacaoEl.addEventListener("click", (evento) => {
            const btn = evento.target.closest("button[data-pagina]");
            if (!btn) return;

            const valor = btn.dataset.pagina;
            if (valor === "anterior") paginaAtual -= 1;
            else if (valor === "proximo") paginaAtual += 1;
            else paginaAtual = parseInt(valor, 10);

            renderizarTabela();
        });

        btnFiltrar.addEventListener("click", () => {
            paginaAtual = 1;
            renderizarTabela();
        });

        btnLimparFiltros.addEventListener("click", () => {
            filtroCliente.value = "";
            filtroVeiculo.value = "";
            filtroStatus.value = "";
            filtroCategoria.value = "";
            filtroRetirada.value = "";
            filtroDevolucao.value = "";
            paginaAtual = 1;
            renderizarTabela();
        });

        // ---------- Calendário ----------

        function renderizarCalendario() {
            const ano = mesCalendario.getFullYear();
            const mes = mesCalendario.getMonth();

            calendarioTituloEl.textContent = mesCalendario.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

            const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
            const totalDiasMes = new Date(ano, mes + 1, 0).getDate();
            const totalDiasMesAnterior = new Date(ano, mes, 0).getDate();

            const celulas = [];

            for (let i = primeiroDiaSemana - 1; i >= 0; i--) {
                celulas.push({ dia: totalDiasMesAnterior - i, foraDoMes: true, data: null });
            }
            for (let d = 1; d <= totalDiasMes; d++) {
                celulas.push({ dia: d, foraDoMes: false, data: new Date(ano, mes, d) });
            }
            let contadorProximoMes = 1;
            while (celulas.length % 7 !== 0) {
                celulas.push({ dia: contadorProximoMes++, foraDoMes: true, data: null });
            }

            calendarioGridEl.innerHTML = celulas
                .map((c) => {
                    if (c.foraDoMes) {
                        return `<div class="dia-calendario fora-mes">${c.dia}</div>`;
                    }

                    const isoAtual = isoData(c.data);
                    const temRetirada = RESERVAS.some((r) => isoData(r.retirada) === isoAtual && r.status !== "cancelada");
                    const temDevolucao = RESERVAS.some((r) => isoData(r.devolucao) === isoAtual && r.status !== "cancelada");
                    const ehHoje = isoAtual === isoData(hoje);
                    const multiplas = temRetirada && temDevolucao;

                    let pontos = "";
                    if (temRetirada) pontos += `<span class="ponto ponto-retirada"></span>`;
                    if (temDevolucao) pontos += `<span class="ponto ponto-devolucao"></span>`;

                    return `<div class="dia-calendario ${ehHoje ? "dia-hoje" : ""} ${multiplas ? "dia-multiplas" : ""}">
                        ${c.dia}
                        ${pontos ? `<div class="pontos">${pontos}</div>` : ""}
                    </div>`;
                })
                .join("");
        }

        calendarioAnteriorBtn.addEventListener("click", () => {
            mesCalendario.setMonth(mesCalendario.getMonth() - 1);
            renderizarCalendario();
        });

        calendarioProximoBtn.addEventListener("click", () => {
            mesCalendario.setMonth(mesCalendario.getMonth() + 1);
            renderizarCalendario();
        });

        // ---------- Modal de detalhes ----------

        function abrirModalDetalhes(id) {
            const r = RESERVAS.find((x) => x.id === id);
            if (!r) return;

            modalCorpoEl.innerHTML = `
                <div class="modal-secao">
                    <div class="modal-secao-titulo">Reserva</div>
                    <div class="modal-grid">
                        <div class="modal-linha"><span class="rotulo">ID</span><span class="valor">${r.id}</span></div>
                        <div class="modal-linha"><span class="rotulo">Status</span><span class="valor"><span class="status-badge status-${r.status}">${statusLabel(r.status)}</span></span></div>
                        <div class="modal-linha"><span class="rotulo">Criada em</span><span class="valor">${formatarDataBR(r.criadoEm)}</span></div>
                    </div>
                </div>
                <div class="modal-secao">
                    <div class="modal-secao-titulo">Cliente</div>
                    <div class="modal-grid">
                        <div class="modal-linha"><span class="rotulo">Nome</span><span class="valor">${r.cliente.nome}</span></div>
                        <div class="modal-linha"><span class="rotulo">Telefone</span><span class="valor">${r.cliente.telefone}</span></div>
                        <div class="modal-linha"><span class="rotulo">E-mail</span><span class="valor">${r.cliente.email}</span></div>
                        <div class="modal-linha"><span class="rotulo">CPF</span><span class="valor">${r.cliente.cpf}</span></div>
                    </div>
                </div>
                <div class="modal-secao">
                    <div class="modal-secao-titulo">Veículo</div>
                    <div class="modal-grid">
                        <div class="modal-linha"><span class="rotulo">Modelo</span><span class="valor">${r.veiculo.modelo}</span></div>
                        <div class="modal-linha"><span class="rotulo">Marca</span><span class="valor">${r.veiculo.marca}</span></div>
                        <div class="modal-linha"><span class="rotulo">Ano</span><span class="valor">${r.veiculo.ano}</span></div>
                        <div class="modal-linha"><span class="rotulo">Placa</span><span class="valor">${r.veiculo.placa}</span></div>
                        <div class="modal-linha"><span class="rotulo">Categoria</span><span class="valor">${r.veiculo.categoria}</span></div>
                    </div>
                </div>
                <div class="modal-secao">
                    <div class="modal-secao-titulo">Locação</div>
                    <div class="modal-grid">
                        <div class="modal-linha"><span class="rotulo">Retirada</span><span class="valor">${formatarDataBR(r.retirada)} às ${r.retiradaHora}</span></div>
                        <div class="modal-linha"><span class="rotulo">Devolução</span><span class="valor">${formatarDataBR(r.devolucao)} às ${r.devolucaoHora}</span></div>
                        <div class="modal-linha"><span class="rotulo">Dias</span><span class="valor">${Math.max(1, diffDias(r.retirada, r.devolucao))}</span></div>
                        <div class="modal-linha"><span class="rotulo">Valor da diária</span><span class="valor">${formatarMoeda(r.diaria)}</span></div>
                        <div class="modal-linha"><span class="rotulo">Valor total</span><span class="valor">${formatarMoeda(r.valorTotal)}</span></div>
                    </div>
                </div>
                <div class="modal-secao">
                    <div class="modal-secao-titulo">Pagamento</div>
                    <div class="modal-grid">
                        <div class="modal-linha"><span class="rotulo">Status</span><span class="valor">${r.pagamento.status}</span></div>
                        <div class="modal-linha"><span class="rotulo">Forma</span><span class="valor">${r.pagamento.forma}</span></div>
                    </div>
                </div>
            `;

            modalEl.classList.remove("oculto");
        }

        function fecharModal() {
            modalEl.classList.add("oculto");
        }

        modalFecharBtn.addEventListener("click", fecharModal);
        modalEl.addEventListener("click", (evento) => {
            if (evento.target === modalEl) fecharModal();
        });

        // ---------- Ações (delegação de evento na tabela) ----------

        tbodyEl.addEventListener("click", (evento) => {
            const btn = evento.target.closest("button[data-action]");
            if (!btn) return;

            const { action, id } = btn.dataset;
            const reserva = RESERVAS.find((r) => r.id === id);
            if (!reserva) return;

            if (action === "ver" || action === "editar") {
                abrirModalDetalhes(id);
                return;
            }
            if (action === "confirmar") reserva.status = "confirmada";
            if (action === "cancelar") reserva.status = "cancelada";
            if (action === "iniciar") reserva.status = "andamento";
            if (action === "finalizar") reserva.status = "finalizada";

            atualizarTudo();
        });

        // ---------- Nova Reserva ----------

        btnNovaReserva.addEventListener("click", () => {
            formNovaReserva.reset();
            modalNovaReservaEl.classList.remove("oculto");
        });

        function fecharModalNovaReserva() {
            modalNovaReservaEl.classList.add("oculto");
        }

        novaReservaFecharBtn.addEventListener("click", fecharModalNovaReserva);
        novaReservaCancelarBtn.addEventListener("click", fecharModalNovaReserva);
        modalNovaReservaEl.addEventListener("click", (evento) => {
            if (evento.target === modalNovaReservaEl) fecharModalNovaReserva();
        });

        formNovaReserva.addEventListener("submit", (evento) => {
            evento.preventDefault();

            const retiradaStr = document.getElementById("nr-retirada").value;
            const devolucaoStr = document.getElementById("nr-devolucao").value;
            const diaria = parseFloat(document.getElementById("nr-diaria").value) || 0;

            const retirada = new Date(retiradaStr + "T00:00:00");
            const devolucao = new Date(devolucaoStr + "T00:00:00");

            if (devolucao <= retirada) {
                alert("A data de devolução precisa ser depois da data de retirada.");
                return;
            }

            const dias = Math.max(1, diffDias(retirada, devolucao));

            RESERVAS.push({
                id: novoId(),
                cliente: {
                    nome: document.getElementById("nr-cliente-nome").value,
                    telefone: document.getElementById("nr-cliente-telefone").value,
                    email: "-",
                    cpf: "-",
                },
                veiculo: {
                    modelo: document.getElementById("nr-veiculo-modelo").value,
                    marca: "-",
                    ano: "-",
                    placa: document.getElementById("nr-veiculo-placa").value,
                    categoria: document.getElementById("nr-veiculo-categoria").value,
                },
                retirada,
                retiradaHora: "10:00",
                devolucao,
                devolucaoHora: "10:00",
                diaria,
                valorTotal: diaria * dias,
                status: "pendente",
                pagamento: { status: "Pendente", forma: "-" },
                criadoEm: hoje,
            });

            fecharModalNovaReserva();
            paginaAtual = 1;
            atualizarTudo();
        });

        // ---------- Render inicial ----------

        function atualizarTudo() {
            renderizarCards();
            renderizarTabelaHoje();
            renderizarAlertas();
            renderizarTabela();
            renderizarCalendario();
        }

        atualizarTudo();
    }

    /* ==================================================================
     * PÁGINA: VEÍCULOS
     * ================================================================== */

    function initPaginaVeiculos() {
        let proximoIdVeiculo = 1;

        function novoIdVeiculo() {
            return "VEI-" + String(proximoIdVeiculo++).padStart(4, "0");
        }

        function formatarMoedaV(valor) {
            return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
        }

        function formatarKm(km) {
            return km.toLocaleString("pt-BR") + " km";
        }

        function statusLabelVeiculo(status) {
            const mapa = {
                disponivel: "Disponível",
                alugado: "Alugado",
                reservado: "Reservado",
                manutencao: "Manutenção",
            };
            return mapa[status] || status;
        }

        function criarVeiculo(modelo, marca, ano, placa, cor, categoria, km, diaria, status, historico) {
            return {
                id: novoIdVeiculo(),
                modelo, marca, ano, placa, cor, categoria, km, diaria, status,
                historico: historico || [],
            };
        }

        let VEICULOS = [
            criarVeiculo("HB20", "Hyundai", 2023, "ABC-1D23", "Prata", "Econômico", 18500, 120, "alugado", [
                { data: "01/09/2026", tipo: "locacao", descricao: "Locação para João Silva" },
            ]),
            criarVeiculo("Corolla", "Toyota", 2024, "DEF-2E34", "Branco", "Sedan", 9800, 180, "disponivel", [
                { data: "20/08/2026", tipo: "manutencao", descricao: "Troca de óleo e revisão" },
            ]),
            criarVeiculo("Onix", "Chevrolet", 2022, "GHI-3F45", "Preto", "Econômico", 32100, 110, "reservado", [
                { data: "10/07/2026", tipo: "locacao", descricao: "Locação para Pedro Oliveira" },
            ]),
            criarVeiculo("Compass", "Jeep", 2024, "JKL-4G56", "Cinza", "SUV", 5200, 260, "disponivel", []),
            criarVeiculo("Civic", "Honda", 2023, "MNO-5H67", "Prata", "Sedan", 21300, 190, "manutencao", [
                { data: "15/09/2026", tipo: "manutencao", descricao: "Reparo no sistema de freios" },
            ]),
            criarVeiculo("Kicks", "Nissan", 2023, "PQR-6I78", "Vermelho", "SUV", 14700, 210, "alugado", [
                { data: "05/09/2026", tipo: "locacao", descricao: "Locação para Fernanda Reis" },
            ]),
            criarVeiculo("Argo", "Fiat", 2022, "STU-7J89", "Branco", "Econômico", 40200, 100, "disponivel", []),
            criarVeiculo("Renegade", "Jeep", 2024, "VWX-8K90", "Azul", "SUV", 3100, 250, "reservado", [
                { data: "18/09/2026", tipo: "locacao", descricao: "Locação para Beatriz Alves" },
            ]),
        ];

        const tbodyEl = document.getElementById("veiculos-tbody");
        if (!tbodyEl) return;

        const filtroBusca = document.getElementById("filtro-busca-veiculo");
        const filtroCategoria = document.getElementById("filtro-categoria-veiculo");
        const filtroStatus = document.getElementById("filtro-status-veiculo");
        const btnFiltrar = document.getElementById("btn-filtrar-veiculos");
        const btnLimpar = document.getElementById("btn-limpar-veiculos");

        const modalVerEl = document.getElementById("modal-veiculo");
        const modalVerCorpoEl = document.getElementById("modal-veiculo-corpo");
        const modalVerFecharBtn = document.getElementById("modal-veiculo-fechar");

        const btnAdicionar = document.getElementById("btn-adicionar-veiculo");
        const modalFormEl = document.getElementById("modal-form-veiculo");
        const modalFormTituloEl = document.getElementById("modal-form-titulo");
        const modalFormFecharBtn = document.getElementById("modal-form-fechar");
        const modalFormCancelarBtn = document.getElementById("modal-form-cancelar");
        const formVeiculo = document.getElementById("form-veiculo");

        const modalStatusEl = document.getElementById("modal-status-veiculo");
        const modalStatusFecharBtn = document.getElementById("modal-status-fechar");
        const statusVeiculoIdInput = document.getElementById("status-veiculo-id");
        const statusVeiculoSelect = document.getElementById("status-veiculo-select");
        const btnSalvarStatus = document.getElementById("btn-salvar-status");
        const btnCancelarStatus = document.getElementById("btn-cancelar-status");

        // ---------- Cards ----------

        function renderizarCardsVeiculos() {
            document.getElementById("card-total-veiculos").textContent = VEICULOS.length;
            document.getElementById("card-disponiveis").textContent = VEICULOS.filter((v) => v.status === "disponivel").length;
            document.getElementById("card-alugados").textContent = VEICULOS.filter((v) => v.status === "alugado").length;
            document.getElementById("card-reservados").textContent = VEICULOS.filter((v) => v.status === "reservado").length;
            document.getElementById("card-manutencao").textContent = VEICULOS.filter((v) => v.status === "manutencao").length;
        }

        // ---------- Filtros ----------

        function obterVeiculosFiltrados() {
            const busca = filtroBusca.value.trim().toLowerCase();
            const categoria = filtroCategoria.value;
            const status = filtroStatus.value;

            return VEICULOS.filter((v) => {
                if (busca && !(v.modelo.toLowerCase().includes(busca) || v.placa.toLowerCase().includes(busca))) return false;
                if (categoria && v.categoria !== categoria) return false;
                if (status && v.status !== status) return false;
                return true;
            });
        }

        btnFiltrar.addEventListener("click", renderizarTabelaVeiculos);
        btnLimpar.addEventListener("click", () => {
            filtroBusca.value = "";
            filtroCategoria.value = "";
            filtroStatus.value = "";
            renderizarTabelaVeiculos();
        });

        // ---------- Ações da tabela ----------

        function renderizarAcoesVeiculo(v) {
            return `
                <button type="button" class="btn-acao acao-ver" data-action="ver" data-id="${v.id}">Visualizar</button>
                <button type="button" class="btn-acao" data-action="editar" data-id="${v.id}">Editar</button>
                <button type="button" class="btn-acao acao-status" data-action="status" data-id="${v.id}">Alterar status</button>
                <button type="button" class="btn-acao acao-excluir" data-action="excluir" data-id="${v.id}">Excluir</button>
            `;
        }

        function renderizarTabelaVeiculos() {
            const filtrados = obterVeiculosFiltrados();

            tbodyEl.innerHTML = filtrados.length
                ? filtrados
                      .map(
                          (v) => `
                <tr>
                    <td class="cliente-nome">${v.modelo} <span style="color: var(--cinza); font-weight: 400;">(${v.marca})</span></td>
                    <td><span class="veiculo-badge">${v.placa}</span></td>
                    <td>${v.categoria}</td>
                    <td>${v.ano}</td>
                    <td>${formatarKm(v.km)}</td>
                    <td>${formatarMoedaV(v.diaria)}</td>
                    <td><span class="status-badge status-${v.status}">${statusLabelVeiculo(v.status)}</span></td>
                    <td><div class="acoes-cell">${renderizarAcoesVeiculo(v)}</div></td>
                </tr>
            `
                      )
                      .join("")
                : `<tr><td colspan="8" style="text-align:center; padding: 24px; color: var(--cinza);">Nenhum veículo encontrado.</td></tr>`;
        }

        // ---------- Modal: visualizar ----------

        function abrirModalVisualizar(id) {
            const v = VEICULOS.find((x) => x.id === id);
            if (!v) return;

            const historicoHtml = v.historico.length
                ? v.historico
                      .map(
                          (h) => `
                    <div class="historico-item">
                        <span class="historico-data">${h.data} — ${h.tipo === "locacao" ? "Locação" : "Manutenção"}</span>
                        ${h.descricao}
                    </div>
                `
                      )
                      .join("")
                : `<p style="color: var(--cinza); font-size: 13px;">Sem histórico registrado.</p>`;

            modalVerCorpoEl.innerHTML = `
                <div class="modal-secao">
                    <div class="modal-secao-titulo">Veículo</div>
                    <div class="modal-grid">
                        <div class="modal-linha"><span class="rotulo">Modelo</span><span class="valor">${v.modelo}</span></div>
                        <div class="modal-linha"><span class="rotulo">Marca</span><span class="valor">${v.marca}</span></div>
                        <div class="modal-linha"><span class="rotulo">Ano</span><span class="valor">${v.ano}</span></div>
                        <div class="modal-linha"><span class="rotulo">Placa</span><span class="valor">${v.placa}</span></div>
                        <div class="modal-linha"><span class="rotulo">Cor</span><span class="valor">${v.cor}</span></div>
                        <div class="modal-linha"><span class="rotulo">Categoria</span><span class="valor">${v.categoria}</span></div>
                        <div class="modal-linha"><span class="rotulo">Quilometragem</span><span class="valor">${formatarKm(v.km)}</span></div>
                        <div class="modal-linha"><span class="rotulo">Valor da diária</span><span class="valor">${formatarMoedaV(v.diaria)}</span></div>
                        <div class="modal-linha"><span class="rotulo">Status</span><span class="valor"><span class="status-badge status-${v.status}">${statusLabelVeiculo(v.status)}</span></span></div>
                    </div>
                </div>
                <div class="modal-secao">
                    <div class="modal-secao-titulo">Histórico</div>
                    ${historicoHtml}
                </div>
            `;
            modalVerEl.classList.remove("oculto");
        }

        modalVerFecharBtn.addEventListener("click", () => modalVerEl.classList.add("oculto"));
        modalVerEl.addEventListener("click", (e) => {
            if (e.target === modalVerEl) modalVerEl.classList.add("oculto");
        });

        // ---------- Modal: adicionar/editar ----------

        function abrirModalForm(id) {
            const editando = !!id;
            const v = editando ? VEICULOS.find((x) => x.id === id) : null;

            modalFormTituloEl.textContent = editando ? "Editar Veículo" : "Adicionar Veículo";
            document.getElementById("vf-id").value = editando ? v.id : "";
            document.getElementById("vf-modelo").value = editando ? v.modelo : "";
            document.getElementById("vf-marca").value = editando ? v.marca : "";
            document.getElementById("vf-ano").value = editando ? v.ano : new Date().getFullYear();
            document.getElementById("vf-placa").value = editando ? v.placa : "";
            document.getElementById("vf-cor").value = editando ? v.cor : "";
            document.getElementById("vf-categoria").value = editando ? v.categoria : "Econômico";
            document.getElementById("vf-km").value = editando ? v.km : 0;
            document.getElementById("vf-diaria").value = editando ? v.diaria : "";
            document.getElementById("vf-status").value = editando ? v.status : "disponivel";

            modalFormEl.classList.remove("oculto");
        }

        function fecharModalForm() {
            modalFormEl.classList.add("oculto");
            formVeiculo.reset();
        }

        btnAdicionar.addEventListener("click", () => abrirModalForm(null));
        modalFormFecharBtn.addEventListener("click", fecharModalForm);
        modalFormCancelarBtn.addEventListener("click", fecharModalForm);
        modalFormEl.addEventListener("click", (e) => {
            if (e.target === modalFormEl) fecharModalForm();
        });

        formVeiculo.addEventListener("submit", (evento) => {
            evento.preventDefault();

            const id = document.getElementById("vf-id").value;
            const dados = {
                modelo: document.getElementById("vf-modelo").value,
                marca: document.getElementById("vf-marca").value,
                ano: parseInt(document.getElementById("vf-ano").value, 10),
                placa: document.getElementById("vf-placa").value,
                cor: document.getElementById("vf-cor").value,
                categoria: document.getElementById("vf-categoria").value,
                km: parseInt(document.getElementById("vf-km").value, 10) || 0,
                diaria: parseFloat(document.getElementById("vf-diaria").value) || 0,
                status: document.getElementById("vf-status").value,
            };

            if (id) {
                const v = VEICULOS.find((x) => x.id === id);
                Object.assign(v, dados);
            } else {
                VEICULOS.push(criarVeiculo(dados.modelo, dados.marca, dados.ano, dados.placa, dados.cor, dados.categoria, dados.km, dados.diaria, dados.status, []));
            }

            fecharModalForm();
            atualizarTudoVeiculos();
        });

        // ---------- Modal: alterar status ----------

        function abrirModalStatus(id) {
            const v = VEICULOS.find((x) => x.id === id);
            if (!v) return;
            statusVeiculoIdInput.value = id;
            statusVeiculoSelect.value = v.status;
            modalStatusEl.classList.remove("oculto");
        }

        function fecharModalStatus() {
            modalStatusEl.classList.add("oculto");
        }

        modalStatusFecharBtn.addEventListener("click", fecharModalStatus);
        btnCancelarStatus.addEventListener("click", fecharModalStatus);
        modalStatusEl.addEventListener("click", (e) => {
            if (e.target === modalStatusEl) fecharModalStatus();
        });

        btnSalvarStatus.addEventListener("click", () => {
            const v = VEICULOS.find((x) => x.id === statusVeiculoIdInput.value);
            if (v) v.status = statusVeiculoSelect.value;
            fecharModalStatus();
            atualizarTudoVeiculos();
        });

        // ---------- Delegação de ações na tabela ----------

        tbodyEl.addEventListener("click", (evento) => {
            const btn = evento.target.closest("button[data-action]");
            if (!btn) return;

            const { action, id } = btn.dataset;

            if (action === "ver") abrirModalVisualizar(id);
            if (action === "editar") abrirModalForm(id);
            if (action === "status") abrirModalStatus(id);
            if (action === "excluir") {
                if (confirm("Tem certeza que deseja excluir este veículo?")) {
                    VEICULOS = VEICULOS.filter((v) => v.id !== id);
                    atualizarTudoVeiculos();
                }
            }
        });

        // ---------- Render inicial ----------

        function atualizarTudoVeiculos() {
            renderizarCardsVeiculos();
            renderizarTabelaVeiculos();
        }

        atualizarTudoVeiculos();
    }

    /* ==================================================================
     * PÁGINA: CLIENTES
     * Dados mockados em memória — sem backend, seguindo o mesmo padrão
     * das páginas de Reservas e Veículos.
     * ================================================================== */

    function initPaginaClientes() {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const ITENS_POR_PAGINA = 5;
        let paginaAtual = 1;
        let proximoIdCliente = 1;

        function novoIdCliente() {
            return "CLI-" + String(proximoIdCliente++).padStart(4, "0");
        }

        function formatarDataBR(iso) {
            if (!iso) return "—";
            const [ano, mes, dia] = iso.split("-");
            return `${dia}/${mes}/${ano}`;
        }

        function statusLabelCliente(status) {
            const mapa = { ativo: "Ativo", inativo: "Inativo", bloqueado: "Bloqueado" };
            return mapa[status] || status;
        }

        function cnhStatus(validadeIso) {
            if (!validadeIso) return null;
            return new Date(validadeIso) >= hoje ? "valida" : "vencida";
        }

        function cnhLabel(validadeIso) {
            const situacao = cnhStatus(validadeIso);
            if (!situacao) return "—";
            return situacao === "valida" ? `Válida até ${formatarDataBR(validadeIso)}` : `Vencida em ${formatarDataBR(validadeIso)}`;
        }

        function criarCliente(nome, cpf, telefone, email, nascimento, cnh, cnhValidade, endereco, status, cadastradoEm, historico) {
            return {
                id: novoIdCliente(),
                nome, cpf, telefone, email, nascimento, cnh, cnhValidade, endereco, status, cadastradoEm,
                historico: historico || [],
            };
        }

        // ---------- Dados mockados (mesmos clientes usados nas Reservas) ----------

        let CLIENTES = [
            criarCliente("João Silva", "111.111.111-11", "(34) 99111-2222", "joao.silva@email.com", "1990-04-12", "12345678900", "2028-06-10", "Rua das Flores, 120, Centro - Uberlândia/MG", "ativo", "2025-11-02", [
                { data: "01/09/2026", descricao: "Locação: HB20 (Hyundai) — ABC-1D23" },
            ]),
            criarCliente("Maria Souza", "222.222.222-22", "(34) 99222-3333", "maria.souza@email.com", "1988-09-23", "22345678900", "2027-03-15", "Av. Brasil, 540, Santa Mônica - Uberlândia/MG", "ativo", "2025-08-19", [
                { data: "23/09/2026", descricao: "Locação: Corolla (Toyota) — DEF-2E34" },
            ]),
            criarCliente("Pedro Oliveira", "333.333.333-33", "(34) 99333-4444", "pedro.oliveira@email.com", "1995-01-30", "32345678900", "2026-05-20", "Rua Goiás, 88, Tibery - Uberlândia/MG", "ativo", "2026-01-14", [
                { data: "24/09/2026", descricao: "Locação: Onix (Chevrolet) — GHI-3F45" },
            ]),
            criarCliente("Ana Lima", "444.444.444-44", "(34) 99444-5555", "ana.lima@email.com", "1992-07-08", "42345678900", "2029-11-02", "Rua Paraná, 15, Custódio Pereira - Uberlândia/MG", "ativo", "2025-05-27", [
                { data: "20/09/2026", descricao: "Locação: Compass (Jeep) — JKL-4G56" },
            ]),
            criarCliente("Carlos Souza", "555.555.555-55", "(34) 99555-6666", "carlos.souza@email.com", "1985-12-17", "52345678900", "2026-01-09", "Rua Amazonas, 300, Martins - Uberlândia/MG", "ativo", "2025-03-11", [
                { data: "23/09/2026", descricao: "Locação: Civic (Honda) — MNO-5H67" },
            ]),
            criarCliente("Fernanda Reis", "666.666.666-66", "(34) 99666-7777", "fernanda.reis@email.com", "1998-03-05", "62345678900", "2028-08-22", "Av. Rondon Pacheco, 900, Osvaldo Rezende - Uberlândia/MG", "ativo", "2026-02-03", [
                { data: "25/09/2026", descricao: "Locação: Kicks (Nissan) — PQR-6I78" },
            ]),
            criarCliente("Lucas Martins", "777.777.777-77", "(34) 99777-8888", "lucas.martins@email.com", "1993-10-11", "72345678900", "2025-12-01", "Rua Bahia, 47, Fundinho - Uberlândia/MG", "bloqueado", "2024-09-30", [
                { data: "21/09/2026", descricao: "Locação: Argo (Fiat) — STU-7J89 (devolução em atraso)" },
            ]),
            criarCliente("Beatriz Alves", "888.888.888-88", "(34) 99888-9999", "beatriz.alves@email.com", "1997-06-25", "82345678900", "2027-09-14", "Rua Pará, 210, Brasil - Uberlândia/MG", "ativo", "2025-12-20", [
                { data: "26/09/2026", descricao: "Locação: Renegade (Jeep) — VWX-8K90" },
            ]),
            criarCliente("Rafael Costa", "999.999.999-99", "(34) 99999-0000", "rafael.costa@email.com", "1989-02-14", "92345678900", "2026-02-28", "Av. João Naves de Ávila, 1500, Aparecida - Uberlândia/MG", "inativo", "2023-07-08", []),
            criarCliente("Juliana Dias", "101.101.101-01", "(34) 98111-1111", "juliana.dias@email.com", "1994-11-19", "10245678900", "2029-01-17", "Rua Ceará, 66, Nossa Sra. das Graças - Uberlândia/MG", "ativo", "2026-03-09", [
                { data: "28/09/2026", descricao: "Locação: HB20 (Hyundai) — ABC-1D23" },
            ]),
            criarCliente("Marcos Rocha", "202.202.202-02", "(34) 98222-2222", "marcos.rocha@email.com", "1986-08-02", "20245678900", "2025-10-05", "Rua Rio Grande do Sul, 33, Saraiva - Uberlândia/MG", "inativo", "2024-01-22", [
                { data: "18/09/2026", descricao: "Locação: Onix (Chevrolet) — GHI-3F45 (cancelada)" },
            ]),
            criarCliente("Patrícia Nunes", "303.303.303-03", "(34) 98333-3333", "patricia.nunes@email.com", "1991-05-27", "30245678900", "2028-04-30", "Av. Floriano Peixoto, 700, Presidente Roosevelt - Uberlândia/MG", "ativo", "2025-09-17", [
                { data: "19/09/2026", descricao: "Locação: Civic (Honda) — MNO-5H67" },
            ]),
        ];

        // ---------- Elementos do DOM ----------

        const tbodyEl = document.getElementById("clientes-tbody");
        if (!tbodyEl) return;

        const paginacaoEl = document.getElementById("clientes-paginacao");

        const filtroBusca = document.getElementById("filtro-busca-cliente");
        const filtroStatus = document.getElementById("filtro-status-cliente");
        const filtroCnh = document.getElementById("filtro-cnh-cliente");
        const btnFiltrar = document.getElementById("btn-filtrar-clientes");
        const btnLimpar = document.getElementById("btn-limpar-clientes");

        const modalVerEl = document.getElementById("modal-cliente");
        const modalVerCorpoEl = document.getElementById("modal-cliente-corpo");
        const modalVerFecharBtn = document.getElementById("modal-cliente-fechar");

        const btnAdicionar = document.getElementById("btn-adicionar-cliente");
        const modalFormEl = document.getElementById("modal-form-cliente");
        const modalFormTituloEl = document.getElementById("modal-form-cliente-titulo");
        const modalFormFecharBtn = document.getElementById("modal-form-cliente-fechar");
        const modalFormCancelarBtn = document.getElementById("modal-form-cliente-cancelar");
        const formCliente = document.getElementById("form-cliente");

        // ---------- Cards ----------

        function renderizarCardsClientes() {
            document.getElementById("card-total-clientes").textContent = CLIENTES.length;
            document.getElementById("card-clientes-ativos").textContent = CLIENTES.filter((c) => c.status === "ativo").length;
            document.getElementById("card-clientes-bloqueados").textContent = CLIENTES.filter((c) => c.status === "bloqueado").length;
            document.getElementById("card-clientes-novos").textContent = CLIENTES.filter((c) => {
                const cad = new Date(c.cadastradoEm);
                return cad.getFullYear() === hoje.getFullYear() && cad.getMonth() === hoje.getMonth();
            }).length;
        }

        // ---------- Filtros ----------

        function obterClientesFiltrados() {
            const busca = filtroBusca.value.trim().toLowerCase();
            const status = filtroStatus.value;
            const cnh = filtroCnh.value;

            return CLIENTES.filter((c) => {
                if (busca && !(c.nome.toLowerCase().includes(busca) || c.cpf.toLowerCase().includes(busca) || c.email.toLowerCase().includes(busca))) return false;
                if (status && c.status !== status) return false;
                if (cnh && cnhStatus(c.cnhValidade) !== cnh) return false;
                return true;
            });
        }

        btnFiltrar.addEventListener("click", () => {
            paginaAtual = 1;
            atualizarTudoClientes();
        });

        btnLimpar.addEventListener("click", () => {
            filtroBusca.value = "";
            filtroStatus.value = "";
            filtroCnh.value = "";
            paginaAtual = 1;
            atualizarTudoClientes();
        });

        // ---------- Ações da tabela ----------

        function renderizarAcoesCliente(c) {
            return `
                <button type="button" class="btn-acao acao-ver" data-action="ver" data-id="${c.id}">Visualizar</button>
                <button type="button" class="btn-acao" data-action="editar" data-id="${c.id}">Editar</button>
                <button type="button" class="btn-acao acao-excluir" data-action="excluir" data-id="${c.id}">Excluir</button>
            `;
        }

        // ---------- Tabela + paginação ----------

        function renderizarTabelaClientes() {
            const filtrados = obterClientesFiltrados();
            const totalPaginas = Math.max(1, Math.ceil(filtrados.length / ITENS_POR_PAGINA));
            if (paginaAtual > totalPaginas) paginaAtual = totalPaginas;

            const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
            const pagina = filtrados.slice(inicio, inicio + ITENS_POR_PAGINA);

            tbodyEl.innerHTML = pagina.length
                ? pagina
                      .map(
                          (c) => `
                <tr>
                    <td class="cliente-nome">${c.nome}</td>
                    <td><span class="veiculo-badge">${c.cpf}</span></td>
                    <td>${c.telefone}<br><span style="color: var(--cinza); font-size: 12px;">${c.email}</span></td>
                    <td>${cnhLabel(c.cnhValidade)}</td>
                    <td>${c.historico.length}</td>
                    <td><span class="status-badge status-${c.status}">${statusLabelCliente(c.status)}</span></td>
                    <td><div class="acoes-cell">${renderizarAcoesCliente(c)}</div></td>
                </tr>
            `
                      )
                      .join("")
                : `<tr><td colspan="7" style="text-align:center; padding: 24px; color: var(--cinza);">Nenhum cliente encontrado.</td></tr>`;

            renderizarPaginacaoClientes(totalPaginas);
        }

        function renderizarPaginacaoClientes(totalPaginas) {
            if (totalPaginas <= 1) {
                paginacaoEl.innerHTML = "";
                return;
            }

            let botoes = `<button type="button" data-pagina="${paginaAtual - 1}" ${paginaAtual === 1 ? "disabled" : ""}>‹</button>`;
            for (let i = 1; i <= totalPaginas; i++) {
                botoes += `<button type="button" class="${i === paginaAtual ? "ativo" : ""}" data-pagina="${i}">${i}</button>`;
            }
            botoes += `<button type="button" data-pagina="${paginaAtual + 1}" ${paginaAtual === totalPaginas ? "disabled" : ""}>›</button>`;

            paginacaoEl.innerHTML = botoes;
        }

        paginacaoEl.addEventListener("click", (evento) => {
            const btn = evento.target.closest("button[data-pagina]");
            if (!btn || btn.disabled) return;
            paginaAtual = parseInt(btn.dataset.pagina, 10);
            renderizarTabelaClientes();
        });

        // ---------- Modal: visualizar ----------

        function abrirModalVisualizarCliente(id) {
            const c = CLIENTES.find((x) => x.id === id);
            if (!c) return;

            const historicoHtml = c.historico.length
                ? c.historico
                      .map(
                          (h) => `
                    <div class="historico-item">
                        <span class="historico-data">${h.data}</span>
                        ${h.descricao}
                    </div>
                `
                      )
                      .join("")
                : `<p style="color: var(--cinza); font-size: 13px;">Nenhuma locação registrada.</p>`;

            modalVerCorpoEl.innerHTML = `
                <div class="modal-secao">
                    <div class="modal-secao-titulo">Dados pessoais</div>
                    <div class="modal-grid">
                        <div class="modal-linha"><span class="rotulo">Nome</span><span class="valor">${c.nome}</span></div>
                        <div class="modal-linha"><span class="rotulo">CPF</span><span class="valor">${c.cpf}</span></div>
                        <div class="modal-linha"><span class="rotulo">Nascimento</span><span class="valor">${formatarDataBR(c.nascimento)}</span></div>
                        <div class="modal-linha"><span class="rotulo">CNH</span><span class="valor">${c.cnh || "—"}</span></div>
                        <div class="modal-linha"><span class="rotulo">Validade da CNH</span><span class="valor">${cnhLabel(c.cnhValidade)}</span></div>
                        <div class="modal-linha"><span class="rotulo">Status</span><span class="valor"><span class="status-badge status-${c.status}">${statusLabelCliente(c.status)}</span></span></div>
                    </div>
                </div>
                <div class="modal-secao">
                    <div class="modal-secao-titulo">Contato</div>
                    <div class="modal-grid">
                        <div class="modal-linha"><span class="rotulo">Telefone</span><span class="valor">${c.telefone}</span></div>
                        <div class="modal-linha"><span class="rotulo">E-mail</span><span class="valor">${c.email}</span></div>
                        <div class="modal-linha" style="grid-column: 1 / -1;"><span class="rotulo">Endereço</span><span class="valor">${c.endereco || "—"}</span></div>
                        <div class="modal-linha"><span class="rotulo">Cliente desde</span><span class="valor">${formatarDataBR(c.cadastradoEm)}</span></div>
                    </div>
                </div>
                <div class="modal-secao">
                    <div class="modal-secao-titulo">Histórico de locações</div>
                    ${historicoHtml}
                </div>
            `;
            modalVerEl.classList.remove("oculto");
        }

        modalVerFecharBtn.addEventListener("click", () => modalVerEl.classList.add("oculto"));
        modalVerEl.addEventListener("click", (e) => {
            if (e.target === modalVerEl) modalVerEl.classList.add("oculto");
        });

        // ---------- Modal: adicionar/editar ----------

        function abrirModalFormCliente(id) {
            const editando = !!id;
            const c = editando ? CLIENTES.find((x) => x.id === id) : null;

            modalFormTituloEl.textContent = editando ? "Editar Cliente" : "Adicionar Cliente";
            document.getElementById("cf-id").value = editando ? c.id : "";
            document.getElementById("cf-nome").value = editando ? c.nome : "";
            document.getElementById("cf-cpf").value = editando ? c.cpf : "";
            document.getElementById("cf-nascimento").value = editando ? c.nascimento : "";
            document.getElementById("cf-cnh").value = editando ? c.cnh : "";
            document.getElementById("cf-cnh-validade").value = editando ? c.cnhValidade : "";
            document.getElementById("cf-status").value = editando ? c.status : "ativo";
            document.getElementById("cf-telefone").value = editando ? c.telefone : "";
            document.getElementById("cf-email").value = editando ? c.email : "";
            document.getElementById("cf-endereco").value = editando ? c.endereco : "";

            modalFormEl.classList.remove("oculto");
        }

        function fecharModalFormCliente() {
            modalFormEl.classList.add("oculto");
            formCliente.reset();
        }

        btnAdicionar.addEventListener("click", () => abrirModalFormCliente(null));
        modalFormFecharBtn.addEventListener("click", fecharModalFormCliente);
        modalFormCancelarBtn.addEventListener("click", fecharModalFormCliente);
        modalFormEl.addEventListener("click", (e) => {
            if (e.target === modalFormEl) fecharModalFormCliente();
        });

        formCliente.addEventListener("submit", (evento) => {
            evento.preventDefault();

            const id = document.getElementById("cf-id").value;
            const dados = {
                nome: document.getElementById("cf-nome").value,
                cpf: document.getElementById("cf-cpf").value,
                nascimento: document.getElementById("cf-nascimento").value,
                cnh: document.getElementById("cf-cnh").value,
                cnhValidade: document.getElementById("cf-cnh-validade").value,
                status: document.getElementById("cf-status").value,
                telefone: document.getElementById("cf-telefone").value,
                email: document.getElementById("cf-email").value,
                endereco: document.getElementById("cf-endereco").value,
            };

            if (id) {
                const c = CLIENTES.find((x) => x.id === id);
                Object.assign(c, dados);
            } else {
                CLIENTES.push(
                    criarCliente(
                        dados.nome, dados.cpf, dados.telefone, dados.email, dados.nascimento,
                        dados.cnh, dados.cnhValidade, dados.endereco, dados.status,
                        isoData(hoje), []
                    )
                );
            }

            fecharModalFormCliente();
            paginaAtual = 1;
            atualizarTudoClientes();
        });

        function isoData(d) {
            return d.toISOString().split("T")[0];
        }

        // ---------- Delegação de ações na tabela ----------

        tbodyEl.addEventListener("click", (evento) => {
            const btn = evento.target.closest("button[data-action]");
            if (!btn) return;

            const { action, id } = btn.dataset;

            if (action === "ver") abrirModalVisualizarCliente(id);
            if (action === "editar") abrirModalFormCliente(id);
            if (action === "excluir") {
                if (confirm("Tem certeza que deseja excluir este cliente?")) {
                    CLIENTES = CLIENTES.filter((c) => c.id !== id);
                    atualizarTudoClientes();
                }
            }
        });

        // ---------- Render inicial ----------

        function atualizarTudoClientes() {
            renderizarCardsClientes();
            renderizarTabelaClientes();
        }

        atualizarTudoClientes();
    }

    inicializar();
})();


