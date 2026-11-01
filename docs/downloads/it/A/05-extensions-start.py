PRODUCTS = {
    "키링": {"price": 4000, "stock": 3},
    "스티커": {"price": 1000, "stock": 6},
    "노트": {"price": 3000, "stock": 4},
}

# 네 가지 중 정확히 두 개를 선택하세요.
# soldout: 완판 알림 / best: 베스트 상품 / discount: 할인 / receipt: 영수증
SELECTED_FEATURES = ["soldout", "receipt"]
ALLOWED_FEATURES = ["soldout", "best", "discount", "receipt"]


def create_shop(features=None):
    if features is None:
        features = SELECTED_FEATURES
    if len(features) != 2 or len(set(features)) != 2:
        raise ValueError("서로 다른 확장 기능 두 개를 선택하세요.")
    for feature in features:
        if feature not in ALLOWED_FEATURES:
            raise ValueError("알 수 없는 확장 기능입니다.")
    inventory = {}
    for name, item in PRODUCTS.items():
        inventory[name] = {"price": item["price"], "stock": item["stock"]}
    return {"inventory": inventory, "total": 0, "history": [],
            "features": list(features)}


def parse_quantity(text):
    try:
        return int(text)
    except (ValueError, TypeError):
        return None


def calculate_discount(gross):
    # 규칙: 한 번의 주문 금액이 5000원 이상이면 1000원 할인합니다.
    # TODO 선택: 5000원 이상 주문은 1000원 할인. 나머지는 0원.
    return 0


def soldout_message(product, remaining):
    # TODO 선택: remaining이 0이면 완판 문구를 반환하세요.
    return ""


def receipt_lines(transaction):
    # TODO 선택: 단가/수량/할인/결제액이 있는 문자열 목록을 만드세요.
    return []


def best_products(shop):
    # TODO 선택: history의 수량을 상품별로 누적하고 1등(동률 포함)을 찾으세요.
    # 판매가 없으면 빈 목록을 반환하세요.
    return []


def sell(shop, product, quantity):
    if product not in shop["inventory"]:
        return {"ok": False, "message": "목록에 없는 상품입니다."}
    if type(quantity) is not int or quantity <= 0:
        return {"ok": False, "message": "수량은 1 이상의 정수로 입력하세요."}
    item = shop["inventory"][product]
    if quantity > item["stock"]:
        return {"ok": False, "message": "재고가 부족합니다."}
    gross = item["price"] * quantity
    discount = 0
    if "discount" in shop["features"]:
        discount = calculate_discount(gross)
    amount = gross - discount
    item["stock"] = item["stock"] - quantity
    shop["total"] = shop["total"] + amount
    transaction = {"product": product, "quantity": quantity,
                   "unit_price": item["price"], "gross": gross,
                   "discount": discount, "amount": amount}
    shop["history"].append(transaction)
    result = {"ok": True, "message": "판매 완료", "transaction": transaction}
    if "soldout" in shop["features"]:
        result["announcement"] = soldout_message(product, item["stock"])
    if "receipt" in shop["features"]:
        result["receipt"] = receipt_lines(transaction)
    return result


def print_summary(shop):
    print("--- 오늘의 판매 현황 ---")
    for name, item in shop["inventory"].items():
        print(name, "남은 수량:", item["stock"])
    print("오늘 매출:", shop["total"], "원 / 성공한 판매:", len(shop["history"]), "건")
    print("판매 내역:")
    for transaction in shop["history"]:
        print(transaction["product"], transaction["quantity"], "개 /", transaction["amount"], "원")
    if "best" in shop["features"]:
        print("베스트 상품(판매 수량 기준):", best_products(shop))


def main():
    shop = create_shop()
    print("선택한 확장:", ", ".join(shop["features"]))
    print("상품: 키링 / 스티커 / 노트. '마감'으로 종료합니다.")
    while True:
        product = input("상품명 또는 마감: ").strip()
        if product == "마감":
            break
        quantity = parse_quantity(input("수량: "))
        result = sell(shop, product, quantity)
        print(result["message"])
        if result.get("announcement"):
            print(result["announcement"])
        for line in result.get("receipt", []):
            print(line)
        print_summary(shop)
    print("--- 마감 완료 ---")
    print_summary(shop)


if __name__ == "__main__":
    main()
