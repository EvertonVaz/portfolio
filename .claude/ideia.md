# Pong com IA — Arquitetura

## Visão geral

```
┌─────────────┐    Phoenix Channel    ┌─────────────────────┐
│   Frontend  │ ←── game state ─────  │   Elixir (Phoenix)  │
│  (canvas)   │ ──── input ─────────→ │   GenServer/room    │
└─────────────┘                       └────────┬────────────┘
                                               │ RabbitMQ
                                      ┌────────▼────────────┐
                                      │   Python AI Service │
                                      │   (neural network)  │
                                      └─────────────────────┘
```

## Elixir: Phoenix + GenServer por sala de jogo

O projeto atual usa Bandit direto. A migração para Phoenix tem custo baixo a médio — Phoenix 1.7+ usa Bandit como adapter HTTP por padrão, então não há troca de servidor, apenas adição de uma camada em cima. Trabalho necessário:

- Adicionar deps: `phoenix`, `phoenix_pubsub`
- Criar um `Endpoint` Phoenix substituindo a config manual do Bandit
- Migrar handlers `WebSock` existentes para `Phoenix.Channel`
- Ajustar o router

Cada partida é um processo Elixir independente. O game loop roda via `Process.send_after/3`
(tick a cada ~16ms para 60fps).

- **Phoenix Channels** para o frontend — WebSocket nativo, perfeito para estado em tempo real
- **GenServer** mantém o estado do jogo: posição da bola, raquetes, placar

## Fila: Elixir ↔ Python via RabbitMQ

RabbitMQ escolhido pela robustez e garantia de entrega (ACK/NACK).

**Implicação de latência:** RabbitMQ tem latência típica de 1–5ms por mensagem. Com ticks de 16ms (60fps), isso consome 6–30% do budget do tick. A solução é processar a ação com um tick de delay — Elixir publica o estado no tick N, Python responde, Elixir aplica no tick N+1. Esse modelo já é o fluxo natural da arquitetura.

- Elixir: lib `AMQP`
- Python: `aio-pika` (async)

## Fluxo do tick

```
1. Elixir calcula próximo estado do jogo
2. Publica estado no RabbitMQ (queue: "game:{id}:state")
3. Python consome, processa pela rede neural, publica ação ("game:{id}:ai_action")
4. Elixir aplica a ação no próximo tick (N+1)
5. Broadcast do estado para o frontend via Phoenix Channel
```

## Python: rede neural

Para Pong, **Deep Q-Network (DQN)** é o caminho clássico.

**Estado de entrada:**
- posição da bola (x, y)
- velocidade da bola (vx, vy)
- posição da raquete IA
- posição da raquete do jogador

**Ações:** cima, baixo, parado (3 ações)

**Recompensa:** +1 rebateu, -1 perdeu ponto

**Libs:**
- `PyTorch` — loop de treino explícito, mais didático, toda a literatura de DQN atual usa PyTorch
- `Gymnasium` (antigo OpenAI Gym) — para montar o ambiente de treino isolado do jogo real

A IA treina num ambiente simulado em Python, depois o modelo treinado serve via fila para o jogo real.

## Abordagens de IA (do mais simples ao mais sofisticado)

### 1. Rule-based
A raquete segue a bola com velocidade limitada. Não é IA real, mas simula comportamento
convincente e é o ponto de partida ideal para validar a arquitetura.

### 2. Deep Q-Network (DQN)
Rede neural que aprende jogando contra si mesma. A abordagem principal do projeto.

### 3. Neuroevolução (NEAT)
Evolui redes neurais via algoritmos genéticos. Visualmente espetacular — dá para mostrar gerações evoluindo em tempo real no portfólio.

## Ordem de implementação sugerida

1. Migrar Elixir de Bandit puro para Phoenix (habilita Channels)
2. Jogo funcional no Elixir com rule-based AI (valida a arquitetura toda)
3. Integração RabbitMQ entre Elixir e Python
4. Ambiente de treino em Python com Gymnasium + PyTorch
5. Substituir rule-based pelo modelo DQN treinado
