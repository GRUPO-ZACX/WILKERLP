# Ajustes das imagens de revisão

## Aplicados

- Botão do cabeçalho alterado para “Quero saber mais”, uma das opções sugeridas.
- Destaque em dourado e negrito para “não é economia”.
- Título da solução atualizado para incluir “e conseguir vender seu veículo premium pelo melhor preço”.
- Avaliação alterada para “Análise do estado de conservação, estudo de mercado e definição do valor justo”.
- Removidas as vírgulas indicadas em “E como resultado” e no texto de “Melhor valor de mercado”.
- Selo de qualidade centralizado e ajustado à largura disponível no celular.
- Texto do perfil corrigido para “versões topos de linha” e “sem passagem por leilão, sem sinistro e sem bloqueio judicial”.
- FAQ corrigido: “negociações”, “segurança do processo”, “golpes”, “procedência e histórico comprovados” e “avaliação do veículo”.
- Sublinhado removido do texto HTML do banner inicial, usado no desktop. O espaço em “fim, com” já estava correto nesse HTML.
- Bloco final reorganizado: foto acima da caixa no celular e no tablet; caixa à direita no desktop, deixando o rosto livre. A fotografia foi preservada.

## Pendências para você

1. **Banner inicial do celular:** editar ou substituir `assets/hero-banner-mobile-v20261009.webp`. O texto está incorporado à imagem. Corrigir “fim,com” para “fim, com” e retirar o sublinhado de “saúde, família e trabalho”. Alterar o HTML/CSS não modifica esses trechos da imagem. Ao substituir o arquivo, preserve o nome ou atualize o `srcset` do primeiro `<picture>` no `index.html`.
2. **Foto de “Vender o próprio carro…”:** escolher a imagem definitiva. A anotação sugere avaliar a foto da seção de anúncios, mas não define a substituição. O bloco atual usa `assets/problem-car-base-v20261001.webp` e a camada `assets/problem-car-cutout-v20261001.png`; a troca deve considerar as duas camadas para não manter o carro antigo sobre a nova foto.

## Configuração de contato já pendente

Os dois links do WhatsApp em `index.html` estão em `https://wa.me/?text=...`, sem número de destino. É necessário informar o número comercial com DDI e DDD para direcionar a conversa à AM Select Cars. Nenhum número foi presumido.

As alterações foram feitas nos arquivos locais. Não foi realizada publicação em hospedagem.

## Verificação

Conferidos os ajustes em oito larguras, de 320 a 1920 px, a abertura das respostas do FAQ e o botão que leva ao contato, sem erros de JavaScript. Em 1100 px, a seção de problemas já apresentava um excesso horizontal de 25 px no original; esse comportamento preexistente ficou fora das alterações deste pedido.
