from beaker import *
from pyteal import *

class AppState:
    land_reference_number = GlobalStateValue(
        stack_type=TealType.bytes,
    )

    title_deed_number = GlobalStateValue(
        stack_type=TealType.bytes
    )

app = Application(
    "Deed Defender",
    state=AppState(),
    descr="This is Deed Defender"
)

@app.external(authorize=Authorize.only(Global.creator_address()))
def register_land(land_reference_number: abi.String, title_deed_number: abi.String) -> Expr:
    return Seq(
        app.state.land_reference_number.set(land_reference_number.get()),
        app.state.title_deed_number.set(title_deed_number.get())
    )

@app.external(read_only=True)
def get_land_details(*, output: abi.String):
    return output.set(
        Concat(
            app.state.land_reference_number,
            Bytes(" "),
            app.state.title_deed_number
        )
    )

@app.external
def check_land_details(title_deed: abi.String, *, output: abi.Uint64) -> Expr:
    return If(
        title_deed.get() == app.state.title_deed_number
    ).Then(
        output.set(1)
    ).Else(
        output.set(0)
    )

app_spec = app.build()
# print("======================APP SPEC")
# print(app_spec.to_json())