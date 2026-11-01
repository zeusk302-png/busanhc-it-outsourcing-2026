PRODUCTS = {
    "키링": {"price": 4000, "stock": 3},
    "스티커": {"price": 1000, "stock": 6},
    "노트": {"price": 3000, "stock": 4},
}

PRODUCT_NAMES = ["키링", "스티커", "노트"]


def product_info(name):
    if name not in PRODUCTS:
        return None
    return {"name": name, "price": PRODUCTS[name]["price"],
            "stock": PRODUCTS[name]["stock"]}


def main():
    print("상품 목록:", PRODUCT_NAMES)
    name = input("확인할 상품: ").strip()
    info = product_info(name)
    if info is None:
        print("목록에 없는 상품입니다.")
    else:
        print(info["name"], "단가:", info["price"], "남은 수량:", info["stock"])


if __name__ == "__main__":
    main()
