"""가상 교육용 주문 CSV를 공급사별로 분류합니다. 외부 연동은 없습니다."""
import csv
import io
from pathlib import Path

REQUIRED_FIELDS = ["order_id", "supplier", "product", "quantity", "unit_price"]
ALLOWED_SUPPLIERS = ["공급사A", "공급사B"]


def read_orders(text):
    reader = csv.DictReader(io.StringIO(text.lstrip("\ufeff")))
    if reader.fieldnames != REQUIRED_FIELDS:
        raise ValueError("CSV 열은 order_id,supplier,product,quantity,unit_price 순서여야 합니다.")
    rows = []
    for row in reader:
        row["_source_line"] = reader.line_num
        rows.append(row)
    return rows


def validate_row(row, seen_ids):
    if None in row or any(row.get(field) is None for field in REQUIRED_FIELDS):
        return None, "열 개수가 맞지 않습니다."
    cleaned = {}
    for field in REQUIRED_FIELDS:
        cleaned[field] = row[field].strip()
    if not cleaned["order_id"] or not cleaned["product"]:
        return None, "주문번호와 상품명은 비울 수 없습니다."
    if cleaned["order_id"] in seen_ids:
        return None, "이미 처리한 주문번호입니다."
    if cleaned["supplier"] not in ALLOWED_SUPPLIERS:
        return None, "목록에 없는 공급사입니다."
    try:
        quantity = int(cleaned["quantity"])
        unit_price = int(cleaned["unit_price"])
    except ValueError:
        return None, "수량과 단가는 정수여야 합니다."
    if quantity < 1 or quantity > 999 or unit_price < 0:
        return None, "수량은 1~999, 단가는 0 이상이어야 합니다."
    # 파일을 스프레드시트로 열 때 텍스트를 수식으로 실행하지 않도록 제한합니다.
    for field in ["order_id", "product"]:
        if cleaned[field].startswith(("=", "+", "-", "@")):
            return None, "주문번호와 상품명은 수식으로 시작할 수 없습니다."
    cleaned["quantity"] = quantity
    cleaned["unit_price"] = unit_price
    cleaned["amount"] = quantity * unit_price
    return cleaned, None


def process_orders(rows):
    groups = {"공급사A": [], "공급사B": []}
    totals = {"공급사A": 0, "공급사B": 0}
    errors = []
    seen_ids = set()
    for line_number, row in enumerate(rows, start=2):
        order, error = validate_row(row, seen_ids)
        if error:
            errors.append({"line": row.get("_source_line", line_number), "reason": error})
            continue
        seen_ids.add(order["order_id"])
        supplier = order["supplier"]
        groups[supplier].append(order)
        totals[supplier] = totals[supplier] + order["amount"]
    return {"groups": groups, "totals": totals, "errors": errors,
            "accepted_count": len(seen_ids), "total": sum(totals.values())}


def group_csv(orders):
    buffer = io.StringIO(newline="")
    fields = REQUIRED_FIELDS + ["amount"]
    writer = csv.DictWriter(buffer, fieldnames=fields)
    writer.writeheader()
    writer.writerows(orders)
    return buffer.getvalue()


def write_outputs(result, folder):
    folder = Path(folder)
    folder.mkdir(parents=True, exist_ok=True)
    paths = []
    for supplier, orders in result["groups"].items():
        target = folder / (supplier + ".csv")
        target.write_text(group_csv(orders), encoding="utf-8-sig")
        paths.append(str(target))
    return paths


def main():
    import argparse
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", default=str(Path(__file__).with_name("orders-sample.csv")))
    parser.add_argument("--output-dir", default=str(Path(__file__).with_name("output")))
    args = parser.parse_args()
    try:
        result = process_orders(read_orders(Path(args.input).read_text(encoding="utf-8-sig")))
    except (ValueError, OSError) as error:
        print("입력 파일을 확인하세요:", error)
        return 1
    print("정상 주문:", result["accepted_count"], "건 / 제외:", len(result["errors"]), "건")
    print("공급사별 금액:", result["totals"], "/ 전체:", result["total"], "원")
    for error in result["errors"]:
        print("제외한 CSV 행:", error["line"], error["reason"])
    print("분류 파일:", write_outputs(result, args.output_dir))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
