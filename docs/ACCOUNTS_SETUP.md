# 🔑 Guia de Contas & Chaves — Datasets Reais (TerraVista)

> Siga este passo-a-passo para criar as contas gratuitas e obter as credenciais
> usadas pelo `ml/real_data/download.py`. Todas as fontes são **gratuitas**.
> Você só precisa disto para os datasets *reais* — o dataset **sintético** roda
> sem nenhuma credencial.

---

## Resumo rápido

| Fonte | Conta? | Credencial | Dificuldade | Obrigatória? |
|---|---|---|---|---|
| **UCI Forest Fires** | ❌ Não | nenhuma | trivial | ✅ (default, sempre roda) |
| **Kaggle** | ✅ Grátis | `kaggle.json` (token) | fácil | opcional |
| **NASA FIRMS** | ✅ Grátis | `MAP_KEY` | fácil | opcional |
| **NASA Earthdata** | ✅ Grátis | token | médio | só referência |
| **Copernicus (Sentinel)** | ✅ Grátis | OAuth | médio | só referência |
| **OpenRouter** | ✅ Grátis | `API_KEY` | trivial | opcional (chat IA) |

> **Mínimo recomendado:** faça **Kaggle** + **NASA FIRMS** (5–10 min cada).
> UCI já funciona sem nada. Earthdata/Copernicus ficam catalogados, sem download automático.
> **OpenRouter** é só para o assistente de IA do backend — sem chave, o chat usa um
> fallback offline determinístico (a demo funciona mesmo assim).


---

## 1. UCI Forest Fires — ✅ nada a fazer

Dataset público, baixado por URL direta. Nenhuma conta necessária.
O `download.py uci` já funciona de imediato.

- Página: https://archive.ics.uci.edu/dataset/162/forest+fires

---

## 2. Kaggle — token de API (`kaggle.json`)

Usado para baixar datasets como *Crop Recommendation*, *Crop Yield*, etc.

**Passo a passo:**
1. Crie uma conta grátis em https://www.kaggle.com/account/login → "Register".
2. Faça login e vá em **Settings** (canto superior direito → ícone do perfil → *Settings*).
   - Link direto: https://www.kaggle.com/settings
3. Role até a seção **API** e clique em **"Create New Token"**.
4. Um arquivo `kaggle.json` será baixado. Ele contém:
   ```json
   { "username": "seu_usuario", "key": "sua_chave_api" }
   ```
5. Mova esse arquivo para a pasta padrão do Kaggle e ajuste permissões:
   ```bash
   mkdir -p ~/.kaggle
   mv ~/Downloads/kaggle.json ~/.kaggle/kaggle.json
   chmod 600 ~/.kaggle/kaggle.json
   ```
6. Pronto. Teste com:
   ```bash
   pip install kaggle
   kaggle datasets list -s "crop recommendation"
   ```

> ⚠️ Alguns datasets exigem aceitar os termos na página do dataset antes de baixar.

---

## 3. NASA FIRMS — `MAP_KEY` (focos de incêndio em tempo real)

Usado para baixar focos de incêndio ativos (MODIS/VIIRS) — dado quente para o
módulo de *disaster*.

**Passo a passo:**
1. Acesse https://firms.modaps.eosdis.nasa.gov/api/area/
2. Clique em **"Get MAP_KEY"** (ou "Request a Map Key").
3. Informe seu e-mail. A chave chega na hora / por e-mail (string tipo `abcd1234...`).
4. Guarde a chave. Você vai colá-la no arquivo `.env` (veja abaixo).

> A API FIRMS permite consultar focos por área/país e período (ex.: últimos 1–10 dias).

---

## 4. NASA Earthdata — (referência, sem download automático)

Necessário para produtos como **SMAP** (umidade do solo por satélite) e granules
Sentinel via Earthdata. Catalogado em `ml/real_data/SOURCES.md`, mas **não**
automatizamos o download (downloads pesados + OAuth).

**Se quiser explorar manualmente:**
1. Crie conta grátis em https://urs.earthdata.nasa.gov/users/new
2. Gere um token em **Profile → Generate Token**.
3. Use o token nas APIs Earthdata / `earthaccess` (Python).

---

## 5. Copernicus / Sentinel (ESA) — (referência, sem download automático)

Imagens multiespectrais **Sentinel-2** (NDVI) e radar **Sentinel-1** (umidade do solo).
Catalogado em `SOURCES.md`. Útil para a parte de **Visão Computacional**, mas o
download é pesado — usamos imagens de amostra no MVP.

**Se quiser explorar manualmente:**
1. Crie conta grátis em https://dataspace.copernicus.eu/
2. Acesse o **Copernicus Browser** para visualizar/baixar tiles Sentinel-2.

---

## 5b. OpenRouter — chave do assistente de IA (chat)

Usado **só pelo backend** (`/api/chat`) para gerar respostas com IA generativa.
É **opcional**: sem chave, o chat usa um fallback offline determinístico e a demo
funciona normalmente. Com chave, você ganha respostas reais de um LLM — e ainda
de graça no modelo primário.

**Passo a passo:**
1. Crie uma conta grátis em https://openrouter.ai/ (login com Google/GitHub serve).
2. Vá em https://openrouter.ai/keys e clique em **"Create Key"**.
3. Copie a chave gerada (formato `sk-or-v1-...`).
4. Cole no arquivo `backend/.env` (copie de `backend/.env.example`):
   ```bash
   # backend/.env
   OPENROUTER_API_KEY=cole_sua_chave_aqui
   ```
5. Pronto. Reinicie o backend e o `/api/chat` passa a responder via OpenRouter.

**Cadeia de fallback (3 níveis)** — o backend escolhe automaticamente:
1. **Modelo gratuito primário** — `openai/gpt-oss-120b:free` (custo zero).
2. **Fallback pago barato** — `deepseek/deepseek-v4-flash` (~US$0,007 por 1000 respostas),
   acionado só quando o gratuito está com *rate limit* (HTTP 429) ou falha.
3. **Mock offline determinístico** — se ambos falharem ou não houver chave.

> O campo `source` da resposta indica qual nível respondeu
> (`openrouter:<modelo>` ou `mock`). Em 429, o backend ainda tenta **1 retry**
> respeitando o `Retry-After` (limitado a 8s) antes de cair para o próximo nível.

> 💡 Os modelos `:free` da OpenRouter às vezes ficam congestionados (429) por
> serem compartilhados. Por isso o fallback pago existe — é centavos e garante
> que a demo nunca trave por causa do provedor.

---

## 5c. Supabase — persistência dos sensores IoT (opcional)

Usado pelo **backend** para guardar as leituras do ESP32 no Postgres (em vez de
só na memória). **Sem isto a demo funciona** — o backend cai num buffer em
memória automaticamente. Configure só se quiser que os dados sobrevivam a
restarts.

1. Crie um projeto grátis em https://supabase.com
2. No painel: **SQL Editor → New query**, cole o conteúdo de
   `backend/supabase_schema.sql` e rode (cria a tabela `sensor_readings`).
3. **Settings → API**: copie a **Project URL** e a chave **`service_role`**
   (não a `anon`!) para o `backend/.env`:

```bash
# backend/.env
SUPABASE_URL=https://xxxxxxxx.supabase.co
SUPABASE_SERVICE_KEY=cole_a_service_role_key_aqui
SUPABASE_TABLE=sensor_readings
```

4. (Opcional) Popule o banco com ~36 leituras de exemplo para os dashboards:

```bash
backend/.venv/bin/python backend/seed_data.py
```

> ⚠️ A `service_role` key ignora o RLS — use apenas no backend, **nunca** no
> frontend ou em código versionado. O `.env` está no `.gitignore`.

---

## 6. Onde colocar as chaves no projeto


Crie o arquivo `ml/.env` (copie de `ml/.env.example`) e preencha:

```bash
# ml/.env
FIRMS_MAP_KEY=cole_sua_chave_firms_aqui
# Kaggle usa ~/.kaggle/kaggle.json (não precisa ir no .env)
```

> O `.env` está no `.gitignore` — suas chaves **nunca** vão para o repositório.

---

## 7. Checklist do que você precisa fazer

- [ ] (Opcional) Criar conta Kaggle + baixar `kaggle.json` → `~/.kaggle/kaggle.json` (`chmod 600`)
- [ ] (Opcional) Pegar `MAP_KEY` no NASA FIRMS → colar em `ml/.env`
- [ ] (Referência) Criar conta Earthdata — só se quiser explorar SMAP manualmente
- [ ] (Referência) Criar conta Copernicus — só se quiser tiles Sentinel-2 manualmente
- [ ] UCI: nada a fazer ✅

Depois de criar, rode:
```bash
cd ml/real_data
python download.py all     # baixa o que tiver credencial; pula o resto
```
