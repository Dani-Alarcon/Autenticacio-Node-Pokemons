# Autenticació i CRUD amb Node.js (Pokémons & Consoles)

El projecte gestiona **Pokémons** i **Consoles**.

---

## 🔒 Arquitectura i Autenticació

El nucli del sistema de seguretat és el *middleware* **`autenticacio`** (definit a `pokemons.js` i `consoles.js`).

1. **Autenticació JWT:** L'usuari fa login (`/login`), rep un JWT signat pel servidor i l'emmagatzema a una *cookie* segura (`access_token`).
2. **Protecció de Rutes:** El *middleware* `autenticacio` comprova la validesa d'aquest token abans de permetre l'accés a qualsevol ruta CRUD.
3. **Control d'Accés:** Si la validació falla, l'usuari és automàticament **redirigit** a la ruta d'inici (`/`).

### Rutes d'Accés i Configuració (`server.js`)

| Ruta | Mètode | Descripció |
| :--- | :--- | :--- |
| `/` | `GET` | **Pàgina d'inici**. Mostra la vista de login. |
| `/login` | `POST` | Processa les credencials i emet el JWT (cookie). |
| `/logout` | `POST` | Elimina la cookie del JWT i tanca la sessió. |
| `/pokemons` | N/A | Punt d'accés al mòdul de rutes de Pokémons. |
| `/consoles` | N/A | Punt d'accés al mòdul de rutes de Consoles. |

---

## 🛠️ Rutes de Gestió d'Entitats (CRUD)

Els mòduls **`pokemons.js`** i **`consoles.js`** segueixen una estructura de rutes idèntica i ben definida per garantir la modularitat i l'escalabilitat.

### 2.1. Rutes de Lectura i Formulari (`GET`)

| Patró de Ruta | Mètode | Acció (CRUD) | Vista Associada |
| :--- | :--- | :--- | :--- |
| `/` | `GET` | **READ** (Llista) | Mostra el llistat complet de l'entitat. |
| `/create` | `GET` | **READ** (Formulari Nou) | Mostra el formulari per afegir un nou element. |
| `/:id` | `GET` | **READ** (Detall) | Mostra els detalls d'un element. |
| `/edit[Entitat]/:id` | `GET` | **READ** (Formulari Edició) | Mostra el formulari pre-omplert per editar. |

### 2.2. Rutes d'Acció (`POST`, `PUT`, `DELETE`)

Aquestes rutes modifiquen el fitxer de dades (`db.json`) i redirigeixen l'usuari al llistat en cas d'èxit.

| Patró de Ruta | Mètode | Acció | Lògica Clau |
| :--- | :--- | :--- | :--- |
| `/create[Entitat]/` | `POST` | **CREATE** | Crea un nou element. **Assigna una imatge per defecte** si el camp està buit. |
| `/:id` | `PUT` | **UPDATE** | Actualitza un element. Si el camp d'imatge s'envia buit (`""`), es reemplaça per la **imatge per defecte**. |
| `/:id` | `DELETE** | **DELETE** | Elimina l'element amb l'ID especificat. |

> **Nota sobre Mètodes:** Les peticions `PUT` i `DELETE` s'aconsegueixen mitjançant el *query parameter* `?_method=[MÈTODE]` en formularis `POST`, gràcies al *middleware* `method-override`.

---
