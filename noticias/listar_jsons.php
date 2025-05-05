<?php
header('Content-Type: application/json');

$diretorio = './';
$arquivosJson = glob($diretorio . '*.json');

if ($arquivosJson === false) {
    echo json_encode(['erro' => 'Erro ao listar arquivos JSON']);
    exit;
}

if (empty($arquivosJson)) {
    echo json_encode([]);
    exit;
}

$arquivosRelativos = [];
foreach ($arquivosJson as $arquivo) {
    $arquivosRelativos[] = basename($arquivo);
}

echo json_encode($arquivosRelativos);
?>
