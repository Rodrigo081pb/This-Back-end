import requests
import random

url = "https://67b7a9752bddacfb270fa11d.mockapi.io/api/v1/Funcionario"

def listar_funcionarios():
    s = requests.get(url)
    if s.status_code == 200:
        funcionarios = s.json()
        for f in funcionarios:
            print(f"ID: {f['id']}, Nome: {f['nome_funcionario']}, Filial: {f.get('cod_filial')}")
    else:
        print(f"Erro ao listar funcionários: {s.status_code} - {s.text}")

def criar_funcionarias_caxanga():
    nomes = ["Sidney"]
    cargos = ["Desenvolvedor de Software"]
    for nome in nomes:
        cargo_escolhido = random.choice(cargos)
        nova_funcionaria = {
            "nome_funcionario": nome,
            "foto": "https://siney.com/avatar.png",
            "dataNascimento": "19-04-2005",
            "cargo": cargo_escolhido,
            "cod_filial": 7,
            "status": True
        }
        s = requests.post(url, json=nova_funcionaria)
        if s.status_code == 201:
            print(f"Funcionária(o) {nome} criada com sucesso")
        else:
            print(f"Erro ao criar {nome}: {s.status_code} - {s.text}")

def atualizar_funcionario(func_id):
    dados_atualizados = {
        "nome_funcionario": "Kauã Rodrigo Pinheiro Braga",
        "cargo": "Tech Lead"
    }
    s = requests.put(f"{url}/{func_id}", json=dados_atualizados)
    if s.status_code == 200:
        print("Funcionário atualizado com sucesso")
        print(s.json())
    else:
        print(f"Erro ao atualizar funcionário: {s.status_code} - {s.text}")

def deletar_funcionario(func_id):
    s = requests.delete(f"{url}/{func_id}")
    if s.status_code == 200:
        print("removido com sucesso")
        print(s.json())
    else:
        print(f"Erro ao remover funcionário: {s.status_code} - {s.text}")
