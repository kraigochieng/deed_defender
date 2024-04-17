import contract
from beaker import client, localnet
from pprint import pprint
contract.app.build().export("../artifacts/deed_defender")

accounts = localnet.kmd.get_accounts()
creator = accounts[0]
user = accounts[1]


pprint(creator)

creator_app_client = client.ApplicationClient(
    client=localnet.get_algod_client(),
    app=contract.app,
    sender=creator.address,
    signer=creator.signer,
)

creator_app_id, addr, txid = creator_app_client.create()

user_app_client = client.ApplicationClient(
    client=localnet.get_algod_client(),
    app=contract.app,
    sender=user.address,
    signer=user.signer,
    app_id=creator_app_id
)

user_app_id, addr, txid = user_app_client.create()

print(
    f"""
Deployed app in txid {txid}
Creator App ID: {creator_app_id}
App Address: {addr}
"""
)

print()

print(
    f"""
Deployed app in txid {txid}
User App ID: {user_app_id}
App Address: {addr}
"""
)

creator_app_client.call(contract.register_land, land_reference_number="47/123/456", title_deed_number="ABCD")
land_details = creator_app_client.call(contract.get_land_details)

check_1 = creator_app_client.call(contract.check_land_details, title_deed="ABCD")
check_2 = creator_app_client.call(contract.check_land_details, title_deed="ABC")

print(f"register land => {land_details.return_value}")
print(f"check 1 => {check_1.return_value}")
print(f"check 2 => {check_2.return_value}")

try:
    user_app_client.call(contract.register_land, land_reference_number="q", title_deed_number="r")
    print("changed by another")
except Exception as e:
    print("tring to register" + e)

creator_app_client.call(contract.register_land, land_reference_number="b", title_deed_number="e")

print(f"register land => {land_details.return_value}")


