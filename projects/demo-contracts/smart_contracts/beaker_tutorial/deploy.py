import contract
from beaker import client, localnet

contract.app.build().export("../artifacts/beaker_tutorial")

accounts = localnet.kmd.get_accounts()
sender = accounts[0]

app_client = client.ApplicationClient(
    client=localnet.get_algod_client(),
    app=contract.app,
    sender=sender.address,
    signer=sender.signer
)

app_id, addr, txid = app_client.create()

print(
    f"""
Deployed app in txid {txid}
App ID: {app_id}
App Address: {addr}
"""
)


add_return_value = app_client.call(contract.add, a=10, b=5).return_value
print(f"add => {add_return_value}")
