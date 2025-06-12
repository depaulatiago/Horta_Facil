# Horta Fácil Web

Projeto de extensão para recriar o software **Horta Fácil** em formato web, baseado no software original para planejamento, dimensionamento e gerenciamento de hortas comerciais, domésticas e comunitárias.

---

## Funcionalidades

- Gerenciamento de modelos de cultivo (hortaliças) com dados técnicos (ciclo fenológico, espaçamento, produtividade)
- Criação e edição de hortas com seleção das hortaliças e definição da produção semanal desejada
- Cálculo otimizado do dimensionamento da área e módulos de cultivo
- Geração de calendário de cultivo com atividades semanais para cada módulo
- Visualização de relatórios e exportação em PDF (futuro)
- Interface web responsiva e amigável

---

## Tecnologias

- **Backend:** Node.js, Express, SQLite  
- **Frontend:** React, Vite  
- **Banco de dados:** SQLite  
- **Controle de versão:** Git/GitHub

---

## Como rodar o projeto localmente

### Requisitos

- Node.js (v16 ou superior recomendado)
- npm (vem com o Node.js)

### Passos

1. Clone o repositório:

```bash
git clone https://github.com/seu-usuario/horta-facil-web.git
cd horta_facil
````

2. Instale dependências do backend e rode:

```bash
cd backend
npm install
npm run seed    # para criar e popular o banco SQLite
npm run dev     # para iniciar o backend com nodemon
```

3. Em outro terminal, instale e rode o frontend:

```bash
cd ../frontend
npm install
npm run dev
```

4. Acesse no navegador:

* Frontend: `http://localhost:3000` (ou porta que o Vite indicar)
* Backend: `http://localhost:4000`

---

## Estrutura do projeto

```
horta-facil-web/
├── backend/         # API e lógica do servidor
├── frontend/        # Aplicação React
├── docs/            # Documentação do projeto
├── scripts/         # Scripts auxiliares (banco, seed)
├── .gitignore       # Arquivos ignorados pelo Git
├── README.md        # Este arquivo
└── LICENSE          # Licença do projeto
```

---

## Como contribuir

1. Faça um fork do projeto
2. Crie uma branch com sua feature (`git checkout -b minha-feature`)
3. Faça commits claros e frequentes
4. Abra um Pull Request explicando as mudanças

---

## Licença

Este projeto está licenciado sob a licença MIT — veja o arquivo [LICENSE](LICENSE) para detalhes.

---
Projeto criado como extensão universitária.