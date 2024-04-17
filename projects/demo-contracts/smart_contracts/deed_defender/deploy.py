import contract
from beaker import client, localnet
from pprint import pprint
contract.app.build().export("../artifacts/deed_defender")

accounts = localnet.kmd.get_accounts()
sender = accounts[0]

pprint(sender)

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


app_client.call(contract.register_land, land_reference_number="47/123/456", title_deed_number="ABCD")
land_details = app_client.call(contract.get_land_details)
check_1 = app_client.call(contract.check_land_details(title_deed="ABCD"))
check_2 = app_client.call(contract.check_land_details(title_deed="ABC"))
print(f"register land => {land_details.return_value}")
print(f"check 1 => {check_1.return_value}")
print(f"check 2 => {check_2.return_value}")
