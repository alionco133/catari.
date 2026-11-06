"use strict";

const STORAGE_KEY = "moveis_catarinense_desktop";

const STATUS = [
    "Orçamento",
    "Aprovado",
    "Em produção",
    "Pronto"
];

const hoje = new Date();

function dataISO(dias = 0) {
    const data = new Date();
    data.setDate(data.getDate() + dias);

    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}

const dadosIniciais = {
    clientes: [
        {
            id: 1,
            nome: "Ana Carolina Souza",
            telefone: "(41) 99912-3456",
            email: "ana@email.com",
            endereco: "Centro, Paranaguá - PR"
        },
        {
            id: 2,
            nome: "Roberto Almeida",
            telefone: "(41) 99876-5432",
            email: "roberto@email.com",
            endereco: "João Gualberto, Paranaguá - PR"
        },
        {
            id: 3,
            nome: "Mariana Costa",
            telefone: "(41) 99123-4567",
            email: "mariana@email.com",
            endereco: "Raia, Paranaguá - PR"
        },
        {
            id: 4,
            nome: "Carlos Eduardo Lima",
            telefone: "(41) 99771-2233",
            email: "carlos@email.com",
            endereco: "Porto dos Padres, Paranaguá - PR"
        }
    ],

    pedidos: [
        {
            id: 101,
            clienteId: 1,
            movel: "Guarda-roupa planejado",
            ambiente: "Quarto",
            material: "MDF branco e amadeirado",
            medidas: "2,40 x 2,60 m",
            valor: 4850,
            status: "Em produção",
            data: dataISO(-8),
            entrega: dataISO(12),
            descricao: "Guarda-roupa com portas de correr, divisórias e gavetas.",
            observacoes: "Confirmar puxadores antes da montagem.",
            arquivos: "Desenho técnico do guarda-roupa"
        },
        {
            id: 102,
            clienteId: 2,
            movel: "Cozinha planejada",
            ambiente: "Cozinha",
            material: "MDF cinza",
            medidas: "3,20 m linear",
            valor: 9200,
            status: "Aprovado",
            data: dataISO(-5),
            entrega: dataISO(20),
            descricao: "Armários superiores e inferiores.",
            observacoes: "Cliente aprovou o acabamento.",
            arquivos: "Projeto da cozinha"
        },
        {
            id: 103,
            clienteId: 3,
            movel: "Painel para TV",
            ambiente: "Sala",
            material: "MDF amadeirado",
            medidas: "2,00 x 1,80 m",
            valor: 2150,
            status: "Orçamento",
            data: dataISO(-2),
            entrega: "",
            descricao: "Painel suspenso com nicho para equipamentos.",
            observacoes: "Aguardando retorno do cliente.",
            arquivos: ""
        },
        {
            id: 104,
            clienteId: 4,
            movel: "Balcão sob medida",
            ambiente: "Área gourmet",
            material: "MDF preto fosco",
            medidas: "1,80 x 0,90 m",
            valor: 1850,
            status: "Pronto",
            data: dataISO(-14),
            entrega: dataISO(0),
            descricao: "Balcão sob medida com portas e prateleira interna.",
            observacoes: "Avisar cliente para combinar retirada.",
            arquivos: "Referência do balcão"
        }
    ],

    proximoCliente: 5,
    proximoPedido: 105
};

let dados;

try {
    const salvo = localStorage.getItem(STORAGE_KEY);
    dados = salvo ? JSON.parse(salvo) : dadosIniciais;

    if (!dados || !Array.isArray(dados.clientes) ||
        !Array.isArray(dados.pedidos)) {
        dados = dadosIniciais;
    }
} catch (erro) {
    dados = dadosIniciais;
}

let pedidoSelecionado = null;
let timerToast;

function salvar() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
    } catch (erro) {
        mostrarToast("Não foi possível salvar os dados.");
    }
}

function moeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function formatarData(data) {
    if (!data) return "Não informado";

    const partes = data.split("-");
    if (partes.length !== 3) return "Não informado";

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function escapar(texto) {
    return String(texto ?? "").replace(/[&<>"']/g, caractere => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[caractere]);
}

function mostrarToast(mensagem) {
    const toast = document.getElementById("toast");

    toast.textContent = mensagem;
    toast.classList.add("show");

    clearTimeout(timerToast);

    timerToast = setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

function buscarCliente(id) {
    return dados.clientes.find(cliente => cliente.id === Number(id));
}

function classeStatus(status) {
    if (status === "Orçamento") return "status-orcamento";
    if (status === "Aprovado") return "status-aprovado";
    if (status === "Pronto") return "status-pronto";

    return "status-producao";
}

function criarCard(pedido) {
    const cliente = buscarCliente(pedido.clienteId);
    const nomeCliente = cliente ? cliente.nome : "Cliente não encontrado";

    return `
        <article class="order-card"
            tabindex="0"
            data-order-id="${pedido.id}">

            <small>
                PED-${String(pedido.id).padStart(3, "0")}
                · ${escapar(pedido.status)}
            </small>

            <h4>${escapar(pedido.movel)}</h4>

            <p>${escapar(nomeCliente)}</p>

            <div class="card-bottom">
                <span>${formatarData(pedido.data)}</span>
                <strong>${moeda(pedido.valor)}</strong>
            </div>
        </article>
    `;
}

function renderizarKanban(idElemento, pedidos) {
    const elemento = document.getElementById(idElemento);

    elemento.innerHTML = STATUS.map(status => {
        const lista = pedidos.filter(p => p.status === status);

        return `
            <div class="column">
                <div class="column-header">
                    <span>${status}</span>
                    <span class="count">${lista.length}</span>
                </div>

                ${
                    lista.length
                    ? lista.map(criarCard).join("")
                    : '<p class="empty">Nenhum pedido</p>'
                }
            </div>
        `;
    }).join("");
}

function renderizarEstatisticas() {
    document.getElementById("stat-total").textContent =
        dados.pedidos.length;

    document.getElementById("stat-production").textContent =
        dados.pedidos.filter(p => p.status === "Em produção").length;

    document.getElementById("stat-ready").textContent =
        dados.pedidos.filter(p => p.status === "Pronto").length;

    document.getElementById("stat-clients").textContent =
        dados.clientes.length;
}

function renderizarClientes(pesquisa = "") {
    const termo = pesquisa.toLowerCase().trim();

    const clientes = dados.clientes.filter(cliente => {
        const texto = `${cliente.nome} ${cliente.telefone} ${cliente.email}`;
        return texto.toLowerCase().includes(termo);
    });

    document.getElementById("client-count").textContent =
        `${clientes.length} cliente(s) encontrado(s)`;

    document.getElementById("clients-empty")
        .classList.toggle("hidden", clientes.length > 0);

    document.getElementById("clients-table").innerHTML =
        clientes.map(cliente => {
            const pedidos = dados.pedidos.filter(
                pedido => pedido.clienteId === cliente.id
            );

            const ultimo = pedidos.slice().sort(
                (a, b) => b.data.localeCompare(a.data)
            )[0];

            return `
                <tr>
                    <td>
                        <span class="client-name">
                            ${escapar(cliente.nome)}
                        </span>
                    </td>

                    <td>${escapar(cliente.telefone)}</td>

                    <td>${ultimo ? formatarData(ultimo.data) : "—"}</td>

                    <td>${pedidos.length}</td>

                    <td>
                        <span class="status ${
                            pedidos.length
                            ? "status-aprovado"
                            : "status-orcamento"
                        }">
                            ${pedidos.length ? "Com pedidos" : "Sem pedidos"}
                        </span>
                    </td>

                    <td>
                        <button class="row-action"
                            data-client-history="${cliente.id}">
                            Ver histórico
                        </button>
                    </td>
                </tr>
            `;
        }).join("");
}

function renderizarPedidos() {
    const pesquisa = document.getElementById("order-search")
        .value.toLowerCase().trim();

    const status = document.getElementById("status-filter").value;

    const filtrados = dados.pedidos.filter(pedido => {
        const cliente = buscarCliente(pedido.clienteId);
        const nome = cliente ? cliente.nome : "";

        const texto = `PED-${pedido.id} ${pedido.movel} ${nome}`
            .toLowerCase();

        return texto.includes(pesquisa) &&
            (!status || pedido.status === status);
    });

    renderizarKanban("orders-kanban", filtrados);
}

function preencherClientesSelect() {
    const select = document.getElementById("order-client");

    select.innerHTML = dados.clientes.map(cliente => `
        <option value="${cliente.id}">
            ${escapar(cliente.nome)}
        </option>
    `).join("");
}

function renderizarTudo() {
    renderizarEstatisticas();

    renderizarKanban("dashboard-kanban", dados.pedidos);

    renderizarClientes(
        document.getElementById("client-search").value
    );

    renderizarPedidos();

    preencherClientesSelect();
}

function navegar(pagina) {
    document.querySelectorAll(".page").forEach(secao => {
        secao.classList.toggle(
            "active",
            secao.id === `page-${pagina}`
        );
    });

    document.querySelectorAll(".nav-link").forEach(botao => {
        botao.classList.toggle(
            "active",
            botao.dataset.page === pagina
        );
    });

    const titulos = {
        painel: "Painel",
        clientes: "Clientes",
        pedidos: "Pedidos",
        detalhes: "Detalhes do pedido"
    };

    document.getElementById("page-title").textContent =
        titulos[pagina] || "Painel";
}

function abrirPedido(id) {
    const pedido = dados.pedidos.find(
        item => item.id === Number(id)
    );

    if (!pedido) return;

    pedidoSelecionado = pedido.id;
    renderizarDetalhes(pedido);
    navegar("detalhes");
}

function renderizarDetalhes(pedido) {
    const cliente = buscarCliente(pedido.clienteId) || {};

    document.getElementById("detail-title").textContent =
        pedido.movel;

    document.getElementById("detail-subtitle").textContent =
        `Pedido PED-${String(pedido.id).padStart(3, "0")}`;

    document.getElementById("detail-client").textContent =
        cliente.nome || "—";

    document.getElementById("detail-phone").textContent =
        cliente.telefone || "—";

    document.getElementById("detail-email").textContent =
        cliente.email || "—";

    document.getElementById("detail-address").textContent =
        cliente.endereco || "—";

    document.getElementById("detail-furniture").textContent =
        pedido.movel || "—";

    document.getElementById("detail-room").textContent =
        pedido.ambiente || "—";

    document.getElementById("detail-material").textContent =
        pedido.material || "—";

    document.getElementById("detail-measures").textContent =
        pedido.medidas || "—";

    document.getElementById("detail-description").textContent =
        pedido.descricao || "Nenhuma descrição informada.";

    document.getElementById("detail-notes").textContent =
        pedido.observacoes || "Nenhuma observação informada.";

    document.getElementById("detail-status").textContent =
        pedido.status;

    document.getElementById("detail-date").textContent =
        formatarData(pedido.data);

    document.getElementById("detail-delivery").textContent =
        formatarData(pedido.entrega);

    document.getElementById("detail-value").textContent =
        moeda(pedido.valor);

    document.getElementById("detail-files").textContent =
        pedido.arquivos || "Nenhum arquivo informado.";
}

function abrirModal(id) {
    document.getElementById(id).classList.remove("hidden");
}

function fecharModais() {
    document.querySelectorAll(".modal-bg").forEach(modal => {
        modal.classList.add("hidden");
    });
}

function cadastrarCliente(evento) {
    evento.preventDefault();

    const cliente = {
        id: dados.proximoCliente++,
        nome: document.getElementById("client-name").value.trim(),
        telefone: document.getElementById("client-phone").value.trim(),
        email: document.getElementById("client-email").value.trim(),
        endereco: document.getElementById("client-address").value.trim()
    };

    if (!cliente.nome || !cliente.telefone) {
        mostrarToast("Preencha nome e telefone.");
        return;
    }

    dados.clientes.push(cliente);

    salvar();
    document.getElementById("client-form").reset();
    fecharModais();
    renderizarTudo();

    mostrarToast("Cliente cadastrado com sucesso!");
}

function cadastrarPedido(evento) {
    evento.preventDefault();

    const clienteId = Number(
        document.getElementById("order-client").value
    );

    if (!buscarCliente(clienteId)) {
        mostrarToast("Cadastre um cliente primeiro.");
        return;
    }

    const pedido = {
        id: dados.proximoPedido++,
        clienteId,
        movel: document.getElementById("order-furniture").value.trim(),
        ambiente: document.getElementById("order-room").value.trim(),
        material: document.getElementById("order-material").value.trim(),
        medidas: document.getElementById("order-measures").value.trim(),
        valor: Number(document.getElementById("order-value").value),
        status: "Orçamento",
        data: dataISO(),
        entrega: document.getElementById("order-delivery").value,
        descricao: document.getElementById("order-description").value.trim(),
        observacoes: document.getElementById("order-notes").value.trim(),
        arquivos: ""
    };

    dados.pedidos.push(pedido);

    salvar();
    document.getElementById("order-form").reset();
    fecharModais();
    renderizarTudo();

    mostrarToast("Pedido cadastrado com sucesso!");

    abrirPedido(pedido.id);
}

function alterarStatus() {
    const pedido = dados.pedidos.find(
        item => item.id === pedidoSelecionado
    );

    if (!pedido) return;

    const novoStatus = prompt(
        "Digite o novo status:\n" + STATUS.join("\n"),
        pedido.status
    );

    if (novoStatus === null) return;

    if (!STATUS.includes(novoStatus.trim())) {
        mostrarToast("Status inválido. Confira as opções.");
        return;
    }

    pedido.status = novoStatus.trim();

    salvar();
    renderizarTudo();
    renderizarDetalhes(pedido);

    mostrarToast("Status atualizado!");
}

function mostrarHistorico(id) {
    const cliente = buscarCliente(id);

    if (!cliente) return;

    const pedidos = dados.pedidos.filter(
        pedido => pedido.clienteId === cliente.id
    );

    if (!pedidos.length) {
        mostrarToast("Este cliente ainda não possui pedidos.");
        return;
    }

    navegar("pedidos");

    document.getElementById("order-search").value =
        cliente.nome;

    document.getElementById("status-filter").value = "";

    renderizarPedidos();
}

/* EVENTOS DOS BOTÕES */

document.addEventListener("click", evento => {
    const nav = evento.target.closest("[data-page]");

    if (nav) {
        navegar(nav.dataset.page);
        return;
    }

    const link = evento.target.closest("[data-page-link]");

    if (link) {
        navegar(link.dataset.pageLink);
        return;
    }

    if (evento.target.closest("[data-new-order]")) {
        if (dados.clientes.length === 0) {
            mostrarToast("Cadastre um cliente primeiro.");
            navegar("clientes");
            abrirModal("client-modal");
            return;
        }

        preencherClientesSelect();
        abrirModal("order-modal");
        return;
    }

    if (evento.target.closest("[data-close]")) {
        fecharModais();
        return;
    }

    const card = evento.target.closest("[data-order-id]");

    if (card) {
        abrirPedido(card.dataset.orderId);
        return;
    }

    const historico = evento.target.closest("[data-client-history]");

    if (historico) {
        mostrarHistorico(historico.dataset.clientHistory);
        return;
    }

    if (evento.target.classList.contains("modal-bg")) {
        fecharModais();
    }
});

document.addEventListener("keydown", evento => {
    if (evento.key === "Escape") {
        fecharModais();
    }

    const card = evento.target.closest("[data-order-id]");

    if (card && (evento.key === "Enter" || evento.key === " ")) {
        evento.preventDefault();
        abrirPedido(card.dataset.orderId);
    }
});

/* FORMULÁRIOS E PESQUISAS */

document.getElementById("add-client").addEventListener("click", () => {
    abrirModal("client-modal");
});

document.getElementById("client-form")
    .addEventListener("submit", cadastrarCliente);

document.getElementById("order-form")
    .addEventListener("submit", cadastrarPedido);

document.getElementById("client-search")
    .addEventListener("input", evento => {
        renderizarClientes(evento.target.value);
    });

document.getElementById("order-search")
    .addEventListener("input", renderizarPedidos);

document.getElementById("status-filter")
    .addEventListener("change", renderizarPedidos);

document.getElementById("change-status")
    .addEventListener("click", alterarStatus);

document.getElementById("global-search")
    .addEventListener("input", evento => {
        const pesquisa = evento.target.value.trim();

        if (!pesquisa) return;

        navegar("pedidos");

        document.getElementById("order-search").value =
            pesquisa;

        renderizarPedidos();
    });

/* INICIALIZAÇÃO */

renderizarTudo();
