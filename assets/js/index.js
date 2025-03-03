const API_URL = "https://67b7d4e42bddacfb271012ce.mockapi.io/api/v1/funcionarios";
const DEFAULT_PHOTO = "https://cdn-icons-png.flaticon.com/512/847/847969.png";

// Navegação entre seções
const homeSection = document.getElementById("homeSection");
const adminSection = document.getElementById("adminSection");
const aboutSection = document.getElementById("aboutSection");

document.getElementById("homeLink").addEventListener("click", () => {
  homeSection.style.display = "block";
  adminSection.style.display = "none";
  aboutSection.style.display = "none";
});
document.getElementById("adminLink").addEventListener("click", () => {
  homeSection.style.display = "none";
  adminSection.style.display = "block";
  aboutSection.style.display = "none";
});
document.getElementById("aboutLink").addEventListener("click", () => {
  homeSection.style.display = "none";
  adminSection.style.display = "none";
  aboutSection.style.display = "block";
});

// Funções utilitárias para formatação de datas e cálculo de idade
function formatarData(isoString) {
  if (!isoString) return "N/D";
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "N/D";
  const dia = String(date.getDate()).padStart(2, "0");
  const mes = String(date.getMonth() + 1).padStart(2, "0");
  const ano = date.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

function calcularIdade(isoString) {
  if (!isoString) return "N/D";
  const nascimento = new Date(isoString);
  if (isNaN(nascimento.getTime())) return "N/D";
  const hoje = new Date();
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const mes = hoje.getMonth() - nascimento.getMonth();
  const dia = hoje.getDate() - nascimento.getDate();
  if (mes < 0 || (mes === 0 && dia < 0)) {
    idade--;
  }
  return idade;
}

// Variáveis e elementos para drag & drop e modais
const openCreateFormBtn = document.getElementById("openCreateFormBtn");
const createModal = document.getElementById("createModal");
const closeCreateModal = document.getElementById("closeCreateModal");
const createForm = document.getElementById("createForm");
const dragArea = document.getElementById("dragArea");
const fotoInput = document.getElementById("fotoInput");

let fileBase64 = null;      // Para criação
let editFileBase64 = null;  // Para edição
let currentDeleteId = null; // Para deleção

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

// Drag & Drop - Criação
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

// Drag & Drop - Edição
const closeEditModal = document.getElementById("closeEditModal");
const editModal = document.getElementById("editModal");
const editForm = document.getElementById("editForm");
const dragAreaEdit = document.getElementById("dragAreaEdit");
const editFotoInput = document.getElementById("editFotoInput");

closeEditModal.addEventListener("click", () => {
  editModal.style.display = "none";
  editForm.reset();
  editFileBase64 = null;
});
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

// Função para converter arquivo para Base64
function handleFile(file, callback) {
  const reader = new FileReader();
  reader.onload = function(evt) {
    callback(evt.target.result);
  };
  reader.readAsDataURL(file);
}

// Submissão do formulário de criação
createForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nome = document.getElementById("nome").value.trim();
  const dataNascimento = document.getElementById("dataNascimento").value.trim();
  const naturalidade = document.getElementById("naturalidade").value.trim();
  const estado = document.getElementById("estado").value.trim();
  const pais = document.getElementById("pais").value.trim();
  const email = document.getElementById("email").value.trim();
  const telefone = document.getElementById("telefone").value.trim();
  const cargo = document.getElementById("cargo").value.trim();
  const filial = parseInt(document.getElementById("filial").value.trim());
  const departamento = document.getElementById("departamento").value.trim();
  const dataAdmissao = document.getElementById("dataAdmissao").value.trim();

  const foto = fileBase64 ? fileBase64 : DEFAULT_PHOTO;

  const novoColaborador = {
    nome_funcionario: nome,
    dataNascimento: dataNascimento,
    naturalidade: naturalidade,
    estado: estado,
    pais: pais,
    email: email,
    telefone: telefone,
    cargo: cargo,
    cod_filial: filial,
    departamento: departamento,
    dataAdmissao: dataAdmissao,
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

// Função para listar colaboradores e atualizar dashboard
async function listarColaboradores() {
  try {
    const response = await fetch(API_URL);
    if (response.ok) {
      const colaboradores = await response.json();
      renderColaboradores(colaboradores);
      updateDashboard(colaboradores);
    } else {
      alert("Erro ao listar colaboradores: " + response.status);
    }
  } catch (error) {
    console.error("Erro na requisição:", error);
    alert("Erro ao conectar com a API.");
  }
}

// Renderiza os cards de colaboradores
function renderColaboradores(colaboradores) {
  const container = document.getElementById("lista-colaboradores");
  container.innerHTML = "";

  colaboradores.forEach(colab => {
    const card = document.createElement("div");
    card.className = "card";
    const fotoUrl = colab.foto && colab.foto !== "" ? colab.foto : DEFAULT_PHOTO;

    card.innerHTML = `
      <div class="icon-container">
        <svg class="icon edit-icon" data-id="${colab.id}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
          <path d="M290.74 93.24l128 128L133.25 506.74a31.99 31.99 0 01-22.62 9.38H32a32 32 0 01-32-32v-78.63c0-8.49 3.37-16.62 9.37-22.63L290.74 93.24zM499.13 60.38l-47.52-47.52c-18.74-18.74-49.14-18.74-67.88 0l-46.52 46.52 128 128 46.52-46.52c18.74-18.74 18.74-49.14 0-67.88z"/>
        </svg>
        <svg class="icon delete-icon" data-id="${colab.id}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
          <path d="M135.2 17.7c3.2-10.2 12.7-17.7 23.6-17.7h130.4c10.9 0 20.4 7.5 23.6 17.7l9.4 30.3H432c8.8 0 16 7.2 16 16s-7.2 16-16 16H416l-21.9 355.1c-1.6 26-23.3 45.2-49.3 45.2H103.2c-26 0-47.6-19.2-49.3-45.2L32 80H16c-8.8 0-16-7.2-16-16s7.2-16 16-16H125.8l9.4-30.3zM96.9 80l21.8 352h211.7l21.8-352H96.9z"/>
        </svg>
      </div>
      <img class="card-img" src="${fotoUrl}" alt="Foto de ${colab.nome_funcionario}">
      <h3>${colab.nome_funcionario}</h3>
      <p><strong>Idade:</strong> ${calcularIdade(colab.dataNascimento)}</p>
      <p><strong>Data Nasc.:</strong> ${formatarData(colab.dataNascimento)}</p>
      <p><strong>Cargo:</strong> ${colab.cargo || "N/D"}</p>
      <p><strong>Filial:</strong> ${colab.cod_filial || "N/D"}</p>
      <p><strong>Dept.:</strong> ${colab.departamento || "N/D"}</p>
      <p><strong>Naturalidade:</strong> ${colab.naturalidade || "N/D"}</p>
      <p><strong>Estado:</strong> ${colab.estado || "N/D"}</p>
      <p><strong>País:</strong> ${colab.pais || "N/D"}</p>
    `;

    container.appendChild(card);
  });

  // Eventos para ícones de editar e deletar
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

// Atualiza o Dashboard da Home com estatísticas
function updateDashboard(colaboradores) {
  // Total de colaboradores
  const total = colaboradores.length;
  document.getElementById("totalColaboradores").innerHTML = `<h3>Total Colaboradores</h3><p>${total}</p>`;

  // Média de idade
  let somaIdades = 0;
  let countIdades = 0;
  colaboradores.forEach(colab => {
    const idade = calcularIdade(colab.dataNascimento);
    if (typeof idade === "number" && !isNaN(idade)) {
      somaIdades += idade;
      countIdades++;
    }
  });
  const mediaIdade = countIdades > 0 ? (somaIdades / countIdades).toFixed(1) : "N/D";
  document.getElementById("mediaIdade").innerHTML = `<h3>Média de Idade</h3><p>${mediaIdade}</p>`;

  // Contagem por Departamento
  const deptCount = {};
  colaboradores.forEach(colab => {
    const dept = colab.departamento || "Não Informado";
    deptCount[dept] = (deptCount[dept] || 0) + 1;
  });
  let deptHtml = "<h3>Departamentos</h3>";
  for (const dept in deptCount) {
    deptHtml += `<p>${dept}: ${deptCount[dept]}</p>`;
  }
  document.getElementById("departamentos").innerHTML = deptHtml;
}

// Abrir modal de edição
async function abrirModalEdicao(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`);
    if (response.ok) {
      const colab = await response.json();
      document.getElementById("editId").value = colab.id;
      document.getElementById("editNome").value = colab.nome_funcionario;
      document.getElementById("editDataNascimento").value = colab.dataNascimento ? colab.dataNascimento.split("T")[0] : "";
      document.getElementById("editNaturalidade").value = colab.naturalidade || "";
      document.getElementById("editEstado").value = colab.estado || "";
      document.getElementById("editPais").value = colab.pais || "Brasil";
      document.getElementById("editEmail").value = colab.email || "";
      document.getElementById("editTelefone").value = colab.telefone || "";
      document.getElementById("editCargo").value = colab.cargo || "";
      document.getElementById("editFilial").value = colab.cod_filial || "";
      document.getElementById("editDepartamento").value = colab.departamento || "";
      document.getElementById("editDataAdmissao").value = colab.dataAdmissao ? colab.dataAdmissao.split("T")[0] : "";
      editFileBase64 = null;
      editModal.style.display = "block";
    } else {
      alert("Erro ao buscar colaborador: " + response.status);
    }
  } catch (error) {
    console.error("Erro ao conectar com a API:", error);
  }
}

editForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("editId").value;
  const nome = document.getElementById("editNome").value.trim();
  const dataNascimento = document.getElementById("editDataNascimento").value.trim();
  const naturalidade = document.getElementById("editNaturalidade").value.trim();
  const estado = document.getElementById("editEstado").value.trim();
  const pais = document.getElementById("editPais").value.trim();
  const email = document.getElementById("editEmail").value.trim();
  const telefone = document.getElementById("editTelefone").value.trim();
  const cargo = document.getElementById("editCargo").value.trim();
  const filial = parseInt(document.getElementById("editFilial").value.trim());
  const departamento = document.getElementById("editDepartamento").value.trim();
  const dataAdmissao = document.getElementById("editDataAdmissao").value.trim();

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
    dataNascimento: dataNascimento,
    naturalidade: naturalidade,
    estado: estado,
    pais: pais,
    email: email,
    telefone: telefone,
    cargo: cargo,
    cod_filial: filial,
    departamento: departamento,
    dataAdmissao: dataAdmissao,
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

// Deleção de colaborador
const deleteModal = document.getElementById("deleteModal");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");

function abrirModalDelete(id) {
  currentDeleteId = id;
  deleteModal.style.display = "block";
}

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

cancelDeleteBtn.addEventListener("click", () => {
  deleteModal.style.display = "none";
  currentDeleteId = null;
});

// Fechar modais ao clicar fora do conteúdo
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

// Listar colaboradores ao carregar a página
window.onload = listarColaboradores;
