# Munhoz Payment 💳

Aplicação web desenvolvida em **Angular 22** (`v22.2.x`) para fluxo e processamento de pagamentos, com interface responsiva e componentes interativos.

---

## 🚀 Como Instalar e Rodar o Projeto

Siga os passos abaixo para executar a aplicação localmente:

### Pré-requisitos
- **[Node.js](https://nodejs.org/)**: Versão `22.x` (LTS recomendada) ou `24.x`
- **[npm](https://www.npmjs.com/)**: Versão `10.x` ou `11.x` (utilizada no projeto: `npm@11.12.1`)
- **[Angular CLI](https://angular.dev/tools/cli)**: Versão `22.x` (opcional globalmente via `npm install -g @angular/cli@22`)

### 1. Clonar o repositório
```bash
git clone https://github.com/seu-usuario/munhoz-payment.git
cd munhoz-payment
```

### 2. Instalar as dependências
Execute o comando abaixo para instalar todos os pacotes necessários:
```bash
npm install
```

### 3. Rodar a aplicação
Inicie o servidor de desenvolvimento local:
```bash
npm start
```
*(ou se preferir com o Angular CLI instalado globalmente: `ng serve`)*

### 4. Acessar no navegador
Abra seu navegador e acesse:
```
http://localhost:4200/
```
A aplicação será recarregada automaticamente sempre que houver alterações no código fonte.

---

## 🎨 Uso do Bootstrap

O projeto utiliza o **[Bootstrap 5](https://getbootstrap.com/)** juntamente com o **[Bootstrap Icons](https://icons.getbootstrap.com/)** para estilização, componentes de interface e design responsivo (layout grid, botões, modais, formulários, alertas e ícones).

### Como o Bootstrap está integrado:
As dependências `bootstrap` e `bootstrap-icons` estão configuradas diretamente no arquivo `angular.json`:

- **Estilos Globais (`styles`)**:
  - `node_modules/bootstrap/dist/css/bootstrap.min.css`: Fornece todo o CSS e sistema de grid responsivo do Bootstrap.
  - `node_modules/bootstrap-icons/font/bootstrap-icons.css`: Disponibiliza o pacote completo de ícones Bootstrap.
- **Scripts (`scripts`)**:
  - `node_modules/bootstrap/dist/js/bootstrap.bundle.min.js`: Inclui os componentes interativos do Bootstrap com suporte a Popper.js.

Dessa forma, qualquer componente Angular do projeto pode usufruir de todas as classes utilitárias, componentes visuais e ícones sem necessidade de importações manuais adicionais nos arquivos `.css` individuais.

---

## 📐 Decisões de Projeto e Arquitetura

### Cumprimento dos Critérios de Aceite
Todos os requisitos e critérios de aceite do fluxo de pagamento foram plenamente atendidos e validados:
- **Fluxo completo de pagamento**: validação dinâmica de formulário, formatação com máscaras em tempo real (`card-mask`), stepper com indicadores de progresso e tela de confirmação/resultado.
- **Regras de validação estritas**: verificação de bandeiras de cartão, algoritmo de Luhn, data de expiração futura e CVV de acordo com a bandeira.
- **Proteção de rotas**: guardas de rota (`payment-result.guard`) para impedir o acesso indevido à tela de resultado sem que um pagamento tenha sido processado.

### Estratégia de Mocks vs. API Real
O projeto foi construído para operar de forma autônoma para testes e demonstrações, mantendo a arquitetura pronta para produção:
- **Simulação de Tráfego Real com Mocks**: Através da constante `useMock` presente em `src/environments/environment.ts`, a aplicação simula o tráfego de dados de forma realista, incluindo delays propositais de processamento de rede e retornos simulados de sucesso e erro (como `HttpErrorResponse` com status `402 Payment Required`).
- **Componente Temporário de Simulação (`SimulatorPanelComponent`)**:
  - Foi desenvolvido um componente temporário flutuante (`<app-simulator-panel>`), visível durante o desenvolvimento e demonstração, que confere controle total ao usuário/avaliador para alternar ativamente entre os cenários de **Sucesso** e **Erro** no processamento do pagamento.
  - Ele opera diretamente integrado ao estado do simulador de mocks, permitindo testar facilmente o comportamento visual da tela de confirmação (transação aprovada) ou de recusa/falha (como saldo insuficiente ou erro de autorização), além de oferecer um botão para reiniciar o fluxo de pagamento do zero.
  - O componente é renderizado condicionalmente via `@if (isMockEnabled)`: ao desativar a flag de mocks (`useMock: false`), ele é automaticamente ocultado da interface sem deixar resíduos no fluxo de produção.
- **Preparado para API / Gateway Real**: Toda a camada de serviços (`PaymentService`) já está implementada utilizando `HttpClient` do Angular com chamadas para `apiUrl`. Para integrar com um backend ou gateway de pagamento real, basta um ajuste mínimo:
  1. Alterar a constante no `src/environments/environment.ts`:
     ```typescript
     export const environment = {
       production: false,
       apiUrl: 'https://sua-api.com/v1', // URL do seu gateway ou backend
       useMock: false // Desativa os mocks, oculta o painel do simulador e ativa as chamadas HTTP reais
     };
     ```
  2. O código passará a realizar requisições HTTP (`GET`, `POST`) diretamente para o serviço remoto sem necessidade de refatoração na lógica de componentes.

---

## 🛠️ Scripts Disponíveis

| Comando | Descrição |
| :--- | :--- |
| `npm start` | Inicia o servidor local de desenvolvimento em `http://localhost:4200` |
| `npm run build` | Compila o projeto otimizado para produção na pasta `dist/` |
| `npm run watch` | Compila o projeto em modo desenvolvimento e monitora alterações |
| `npm test` | Executa a suíte de testes unitários utilizando o [Vitest](https://vitest.dev/) |

---

## 📁 Estrutura do Projeto

```text
src/
└── app/
    ├── core/          # Serviços centrais, guards de rota e modelos globais
    ├── features/      # Módulos funcionais (fluxo de pagamento e painel do simulador)
    ├── mocks/         # Dados simulados e handlers para testes e desenvolvimento
    └── shared/        # Componentes compartilhados (header, footer, stepper), diretivas (máscaras) e utilitários
```

---

## 🧪 Testes Unitários

Para rodar os testes unitários da aplicação com o Vitest:

```bash
npm test
```
