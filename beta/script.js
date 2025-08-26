function salvarDocumento() {
  const form = document.getElementById('docForm');
  const data = {
    nomeProjeto: form.nomeProjeto.value,
    data: form.data.value,
    validade: form.validade.value,
    circulo: form.circulo.value,
    descricao: form.descricao.value,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = "documento.json";
  link.click();
}

function carregarDocumento(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const data = JSON.parse(e.target.result);
    const form = document.getElementById('docForm');
    form.nomeProjeto.value = data.nomeProjeto || '';
    form.data.value = data.data || '';
    form.validade.value = data.validade || '';
    form.circulo.value = data.circulo || '';
    form.descricao.value = data.descricao || '';
  };
  reader.readAsText(file);
}

function salvarCiclo() {
  const form = document.getElementById('cicloForm');
  const data = {
    nome: form.nome.value,
    horario: form.horario.value,
    data: form.data.value,
    link: form.link.value,
    descricao: form.descricao.value,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = "ciclo.json";
  link.click();
}

function carregarCiclo(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const data = JSON.parse(e.target.result);
    const form = document.getElementById('cicloForm');
    form.nome.value = data.nome || '';
    form.horario.value = data.horario || '';
    form.data.value = data.data || '';
    form.link.value = data.link || '';
    form.descricao.value = data.descricao || '';
  };
  reader.readAsText(file);
}
