from beaker import *
from pyteal import *

from beaker.lib.storage import BoxMapping

class AppState:
    # land_reference_number = GlobalStateValue(
    #     stack_type=TealType.bytes,
    # )

    # title_deed_number = GlobalStateValue(
    #     stack_type=TealType.bytes
    # )

    land_reference_and_title_deed = GlobalStateValue(
        stack_type=TealType.bytes,
        default=Bytes("")
    )
    
    # land_title_mapping = BoxMapping(abi.String, abi.String)

app = Application(
    "Deed Defender",
    state=AppState(),
    descr="This is Deed Defender"
).apply(unconditional_create_approval, initialize_global_state=True)



# @app.external()
# def register_land(land_reference_number: abi.String, title_deed_number: abi.String) -> Expr:
#     return Seq(
#         app.state.land_reference_number.set(land_reference_number.get()),
#         app.state.title_deed_number.set(title_deed_number.get())
#     )

@app.external()
def register_land(land_reference_and_title_deed: abi.String) -> Expr:
    # Concatenating existing string with new string
    return Seq(
        app.state.land_reference_and_title_deed.set(
            Concat(
                app.state.land_reference_and_title_deed.get(),
                land_reference_and_title_deed.get()
            )
        )
    )

# @app.external(read_only=True)
# def get_land_details(*, output: abi.String):
    # return output.set(
    #     Concat(
    #         app.state.land_reference_number,
    #         Bytes(" "),
    #         app.state.title_deed_number
    #     )
    # )

# @app.external
# def get_land_details(land: abi.String, *, output: abi.String):
    # return app.state.land_title_mapping[land.get()].store_into(output)
    # return output.set(app.state.land_title_mapping[land.get()].get())

@app.external
def get_land(*, output: abi.String) -> Expr:
    return output.set(app.state.land_reference_and_title_deed.get())

# @app.external
# def verify_land_reference_number_existence(land_reference_number: abi.String, *, output: abi.Uint64) -> Expr:
#     return If(
#         land_reference_number.get() == app.state.land_reference_number
#     ).Then(
#         output.set(1)
#     ).Else(
#         output.set(0)
#     )

# @app.external
# def verify_title_deed(*, output: abi.String) -> Expr:
#     return output.set(app.state.title_deed_number)

# app_spec = app.build()
# print("======================APP SPEC")
# print(app_spec.to_json())