import pyteal as pt
from beaker import *

app = Application("MyRadApp", descr="This is a rad app")

# use the decorator provided on the `app` object to register a handler
@app.external
def add(a: pt.abi.Uint64, b: pt.abi.Uint64, *, output: pt.abi.Uint64) -> pt.Expr:
    return output.set(a.get() + b.get())


app_spec = app.build()
print("======================APP SPEC")
print(app_spec.to_json())