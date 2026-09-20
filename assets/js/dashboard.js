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
 * 3) Ao clicar em um item do menu, busca o arquivo correspondente em /pages
 *    e substitui apenas o conteúdo de #main-content — a sidebar nunca recarrega.
 *
 * Para adicionar uma nova página:
 *   a) Crie o arquivo .html dentro de /pages (apenas o conteúdo interno,
 *      sem <html>/<head>/<body> e SEM a sidebar).
 *   b) Adicione uma entrada no objeto ROUTES abaixo.
 *   c) Adicione um link com data-page="chave" dentro de partials/sidebar.html.
 */

(function () {
    "use strict";

    // Mapa central de rotas: chave -> arquivo dentro de /pages
    const ROUTES = {
        inicio: "pagesdashboard/inicio.html",
        veiculos: "pagesdashboard/veiculosdashboard.html",
        reservas: "pagesdashboard/reservasdashboard.html",
        clientes: "pagesdashboard/clientesdashboard.html",
        financeiro: "pagesdashboard/financeirodashboard.html",
        relatorios: "pagesdashboard/relatoriosdashboard.html",
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

    async function carregarPagina(pageKey) {
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
            marcarLinkAtivo(pageKey);

            // Atualiza a URL (hash) sem recarregar a página
            history.replaceState({ pageKey }, "", `#${pageKey}`);
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

    async function inicializar() {
        // 1) Carrega a sidebar (e liga os cliques dela)
        await carregarSidebar();

        // 2) Só então carrega o conteúdo inicial (respeitando o hash da URL, se houver)
        const paginaPelaUrl = window.location.hash
            ? window.location.hash.replace("#", "")
            : PAGINA_PADRAO;

        carregarPagina(ROUTES[paginaPelaUrl] ? paginaPelaUrl : PAGINA_PADRAO);
    }

    inicializar();
})();
