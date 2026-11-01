PRODUCTS = {
    "키링": {"price": 4000, "stock": 3},
    "스티커": {"price": 1000, "stock": 6},
    "노트": {"price": 3000, "stock": 4},
}

def create_shop():
    # 매번 새 상태를 만들어 이전 실행의 재고와 매출을 섞지 않습니다.
    inventory = {}
    for name, item in PRODUCTS.items():
        inventory[name] = {"price": item["price"], "stock": item["stock"]}
    return {"inventory": inventory, "total": 0, "history": []}


def parse_quantity(text):
    try:
        quantity = int(text)
    except (ValueError, TypeError):
        return None
    return quantity


def sell(shop, product, quantity):
    # 실패한 주문에서는 재고, 매출, 판매 내역을 모두 바꾸지 않습니다.
    if product not in shop["inventory"]:
        return {"ok": False, "message": "목록에 없는 상품입니다."}
    if type(quantity) is not int or quantity <= 0:
        return {"ok": False, "message": "수량은 1 이상의 정수로 입력하세요."}
    item = shop["inventory"][product]
    if quantity > item["stock"]:
        return {"ok": False, "message": "재고가 부족합니다."}
    # TODO 3: 판매 금액을 계산하고 재고를 빼고 매출에 더하세요.
    # 실패 주문 검사 위의 코드는 그대로 두세요.
    raise NotImplementedError("TODO 3: 성공한 판매의 상태 변경")
    amount = 0
    transaction = {"product": product, "quantity": quantity,
                   "unit_price": item["price"], "amount": amount}
    shop["history"].append(transaction)
    return {"ok": True, "message": "판매 완료", "transaction": transaction}


def print_summary(shop):
    print("--- 오늘의 판매 현황 ---")
    for name, item in shop["inventory"].items():
        print(name, "남은 수량:", item["stock"])
    print("오늘 매출:", shop["total"], "원")
    print("성공한 판매:", len(shop["history"]), "건")
    for transaction in shop["history"]:
        print(transaction["product"], transaction["quantity"], "개 /",
              transaction["amount"], "원")

def main():
    shop = create_shop()
    print("상품: 키링 4000원 / 스티커 1000원 / 노트 3000원")
    product = input("상품명: ").strip()
    quantity = parse_quantity(input("수량: "))
    result = sell(shop, product, quantity)
    print(result["message"])
    print_summary(shop)


if __name__ == "__main__":
    main()
