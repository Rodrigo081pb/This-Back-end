// URL da API (MockAPI)
const API_URL = "https://67b7a9752bddacfb270fa11d.mockapi.io/api/v1/Funcionario";

// Ícone padrão para quem não enviar foto
const DEFAULT_PHOTO = "https://cdn-icons-png.flaticon.com/512/847/847969.png";

// Referências dos elementos
const openCreateFormBtn = document.getElementById("openCreateFormBtn");
const createModal = document.getElementById("createModal");
const closeCreateModal = document.getElementById("closeCreateModal");
const createForm = document.getElementById("createForm");
const dragArea = document.getElementById("dragArea");
const fotoInput = document.getElementById("fotoInput");

const editModal = document.getElementById("editModal");
const closeEditModal = document.getElementById("closeEditModal");
const editForm = document.getElementById("editForm");
const dragAreaEdit = document.getElementById("dragAreaEdit");
const editFotoInput = document.getElementById("editFotoInput");

const deleteModal = document.getElementById("deleteModal");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");

let fileBase64 = null;      // Para criação
let editFileBase64 = null;  // Para edição
let currentDeleteId = null; // Guardar o ID do colaborador a ser deletado

// --------------
//  Modal de criação
// --------------

// Abrir modal de criação
openCreateFormBtn.addEventListener("click", () => {
  createModal.style.display = "block";
});

// Fechar modal de criação
closeCreateModal.addEventListener("click", () => {
  createModal.style.display = "none";
  createForm.reset();
  fileBase64 = null;
});

// --------------
//  Drag and Drop (Criação)
// --------------
dragArea.addEventListener("click", () => fotoInput.click());

dragArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  dragArea.classList.add("hover");
});

dragArea.addEventListener("dragleave", () => {
  dragArea.classList.remove("hover");
});

dragArea.addEventListener("drop", (e) => {
  e.preventDefault();
  dragArea.classList.remove("hover");
  const file = e.dataTransfer.files[0];
  if (file) {
    handleFile(file, (base64) => fileBase64 = base64);
  }
});

fotoInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    handleFile(file, (base64) => fileBase64 = base64);
  }
});

// Função para converter arquivo em Base64
function handleFile(file, callback) {
  const reader = new FileReader();
  reader.onload = function(evt) {
    callback(evt.target.result);
  };
  reader.readAsDataURL(file);
}

// --------------
//  Formulário de criação (submit)
// --------------
createForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nome = document.getElementById("nome").value.trim();
  const idade = parseInt(document.getElementById("idade").value.trim());
  const dataNascimento = document.getElementById("dataNascimento").value.trim();
  const cargo = document.getElementById("cargo").value.trim();
  const cod_filial = parseInt(document.getElementById("filial").value.trim());

  // Caso não tenha foto, usar a default
  const foto = fileBase64 ? fileBase64 : DEFAULT_PHOTO;

  const novoColaborador = {
    nome_funcionario: nome,
    idade: idade,
    dataNascimento: dataNascimento,
    cargo: cargo,
    cod_filial: cod_filial,
    status: true,
    foto: foto
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(novoColaborador)
    });
    if (response.ok) {
      alert("Colaborador cadastrado com sucesso!");
      createModal.style.display = "none";
      createForm.reset();
      fileBase64 = null;
      listarColaboradores();
    } else {
      alert("Erro ao criar colaborador: " + response.status);
    }
  } catch (error) {
    console.error("Erro na criação:", error);
    alert("Erro ao conectar com a API.");
  }
});

// --------------
//  Listagem de colaboradores
// --------------
async function listarColaboradores() {
  try {
    const response = await fetch(API_URL);
    if (response.ok) {
      const colaboradores = await response.json();
      renderColaboradores(colaboradores);
    } else {
      alert("Erro ao listar colaboradores: " + response.status);
    }
  } catch (error) {
    console.error("Erro na requisição:", error);
    alert("Erro ao conectar com a API.");
  }
}

// Função para renderizar os cards na tela
function renderColaboradores(colaboradores) {
  const container = document.getElementById("lista-colaboradores");
  container.innerHTML = "";

  colaboradores.forEach(colab => {
    const card = document.createElement("div");
    card.className = "card";

    // Verifica se há foto. Se não, usa DEFAULT_PHOTO
    const fotoUrl = colab.foto && colab.foto !== "" ? colab.foto : DEFAULT_PHOTO;

    card.innerHTML = `
      <div class="icon-container">
        <!-- Ícone de lápis (editar) -->
        <svg class="icon edit-icon" data-id="${colab.id}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
          <path d="M290.74 93.24l128 128L133.25 506.74a31.99 31.99 0 01-22.62 9.38H32a32 32 0 01-32-32v-78.63c0-8.49 3.37-16.62 9.37-22.63L290.74 93.24zM499.13 60.38l-47.52-47.52c-18.74-18.74-49.14-18.74-67.88 0l-46.52 46.52 128 128 46.52-46.52c18.74-18.74 18.74-49.14 0-67.88z"/>
        </svg>
        <!-- Ícone de lixeira (deletar) -->
        <svg class="icon delete-icon" data-id="${colab.id}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
          <path d="M135.2 17.7c3.2-10.2 12.7-17.7 23.6-17.7h130.4c10.9 0 20.4 7.5 23.6 17.7l9.4 30.3H432c8.8 0 16 7.2 16 16s-7.2 
          16-16 16H416l-21.9 355.1c-1.6 26-23.3 45.2-49.3 45.2H103.2c-26 0-47.6-19.2-49.3-45.2L32 80H16c-8.8 0-16-7.2-16-16s7.2-16 
          16-16H125.8l9.4-30.3zM96.9 80l21.8 352h211.7l21.8-352H96.9z"/>
        </svg>
      </div>
      <img class="card-img" src="${fotoUrl}" alt="Foto de ${colab.nome_funcionario}">
      <h3>${colab.nome_funcionario}</h3>
      <p><strong>Idade:</strong> ${colab.idade || "N/D"}</p>
      <p><strong>Data Nasc.:</strong> ${colab.dataNascimento || "N/D"}</p>
      <p><strong>Cargo:</strong> ${colab.cargo || "N/D"}</p>
      <p><strong>Filial:</strong> ${colab.cod_filial || "N/D"}</p>
    `;

    container.appendChild(card);
  });

  // Adiciona eventos de clique nos ícones de editar e deletar
  document.querySelectorAll(".edit-icon").forEach(icon => {
    icon.addEventListener("click", (e) => {
      const id = e.currentTarget.getAttribute("data-id");
      abrirModalEdicao(id);
    });
  });
  document.querySelectorAll(".delete-icon").forEach(icon => {
    icon.addEventListener("click", (e) => {
      const id = e.currentTarget.getAttribute("data-id");
      abrirModalDelete(id);
    });
  });
}

// --------------
//  Edição de colaborador
// --------------
async function abrirModalEdicao(id) {
  // Buscar dados do colaborador específico
  try {
    const response = await fetch(`${API_URL}/${id}`);
    if (response.ok) {
      const colab = await response.json();
      // Preenche o formulário de edição
      document.getElementById("editId").value = colab.id;
      document.getElementById("editNome").value = colab.nome_funcionario;
      document.getElementById("editIdade").value = colab.idade || "";
      document.getElementById("editDataNascimento").value = colab.dataNascimento || "";
      document.getElementById("editCargo").value = colab.cargo || "";
      document.getElementById("editFilial").value = colab.cod_filial || "";
      editFileBase64 = null; // reseta a foto em base64
      editModal.style.display = "block";
    } else {
      alert("Erro ao buscar colaborador: " + response.status);
    }
  } catch (error) {
    console.error("Erro ao conectar com a API:", error);
  }
}

// Fechar modal de edição
closeEditModal.addEventListener("click", () => {
  editModal.style.display = "none";
  editForm.reset();
  editFileBase64 = null;
});

// Drag and drop (Edição)
dragAreaEdit.addEventListener("click", () => editFotoInput.click());

dragAreaEdit.addEventListener("dragover", (e) => {
  e.preventDefault();
  dragAreaEdit.classList.add("hover");
});

dragAreaEdit.addEventListener("dragleave", () => {
  dragAreaEdit.classList.remove("hover");
});

dragAreaEdit.addEventListener("drop", (e) => {
  e.preventDefault();
  dragAreaEdit.classList.remove("hover");
  const file = e.dataTransfer.files[0];
  if (file) {
    handleFile(file, (base64) => editFileBase64 = base64);
  }
});

editFotoInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    handleFile(file, (base64) => editFileBase64 = base64);
  }
});

// Submit do formulário de edição
editForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("editId").value;
  const nome = document.getElementById("editNome").value.trim();
  const idade = parseInt(document.getElementById("editIdade").value.trim());
  const dataNascimento = document.getElementById("editDataNascimento").value.trim();
  const cargo = document.getElementById("editCargo").value.trim();
  const cod_filial = parseInt(document.getElementById("editFilial").value.trim());

  // Caso não tenha selecionado nova foto, deixamos como estava ou definimos default
  let fotoAtual = DEFAULT_PHOTO;
  try {
    const res = await fetch(`${API_URL}/${id}`);
    if (res.ok) {
      const dadosAntigos = await res.json();
      fotoAtual = dadosAntigos.foto || DEFAULT_PHOTO;
    }
  } catch (error) {
    console.error("Erro ao buscar dados antigos:", error);
  }

  const foto = editFileBase64 ? editFileBase64 : fotoAtual;

  const dadosAtualizados = {
    nome_funcionario: nome,
    idade: idade,
    dataNascimento: dataNascimento,
    cargo: cargo,
    cod_filial: cod_filial,
    foto: foto
  };

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(dadosAtualizados)
    });
    if (response.ok) {
      alert("Colaborador atualizado com sucesso!");
      editModal.style.display = "none";
      editForm.reset();
      editFileBase64 = null;
      listarColaboradores();
    } else {
      alert("Erro ao atualizar colaborador: " + response.status);
    }
  } catch (error) {
    console.error("Erro na atualização:", error);
    alert("Erro ao conectar com a API.");
  }
});

// --------------
//  Deleção de colaborador
// --------------
function abrirModalDelete(id) {
  currentDeleteId = id;
  deleteModal.style.display = "block";
}

// Botão SIM (confirmar deleção)
confirmDeleteBtn.addEventListener("click", async () => {
  if (!currentDeleteId) return;
  try {
    const response = await fetch(`${API_URL}/${currentDeleteId}`, {
      method: "DELETE"
    });
    if (response.ok) {
      alert("Colaborador demitido com sucesso!");
      deleteModal.style.display = "none";
      listarColaboradores();
    } else {
      alert("Erro ao demitir colaborador: " + response.status);
    }
  } catch (error) {
    console.error("Erro na deleção:", error);
    alert("Erro ao conectar com a API.");
  }
});

// Botão NÃO (cancelar deleção)
cancelDeleteBtn.addEventListener("click", () => {
  deleteModal.style.display = "none";
  currentDeleteId = null;
});

// --------------
//  Ao carregar a página, listar colaboradores
// --------------
window.onload = listarColaboradores;

// --------------
//  Fechar modais ao clicar fora do conteúdo
// --------------
window.addEventListener("click", (event) => {
  if (event.target === createModal) {
    createModal.style.display = "none";
    createForm.reset();
    fileBase64 = null;
  }
  if (event.target === editModal) {
    editModal.style.display = "none";
    editForm.reset();
    editFileBase64 = null;
  }
  if (event.target === deleteModal) {
    deleteModal.style.display = "none";
    currentDeleteId = null;
  }
});
