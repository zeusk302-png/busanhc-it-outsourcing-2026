'use strict';
window.IT_EXAMPLES = {
 pythonFirst:`product = input("상품 이름: ")
price = int(input("단가: "))
quantity = int(input("수량: "))
total = price * quantity
print(product, quantity, "개 /", total, "원")`,
 pythonOrders:`products = {
    "키링": {"price": 4000, "stock": 3},
    "스티커": {"price": 1000, "stock": 6}
}
orders = [("키링", 2), ("스티커", 4), ("키링", 2)]
revenue = 0
for name, quantity in orders:
    if name not in products or quantity < 1:
        print("상품 또는 수량 확인:", name, quantity)
        continue
    item = products[name]
    if quantity > item["stock"]:
        print("재고 부족:", name)
        continue
    item["stock"] -= quantity
    amount = item["price"] * quantity
    revenue += amount
    print(name, quantity, "개 판매 / 결제", amount, "원")
print("하루 매출:", revenue, "원")
print("남은 재고:", products)`,
 pythonProject:`# 품절 알림·할인·영수증·베스트 상품 중 두 가지를 추가하세요.
products = {
    "키링": {"price": 4000, "stock": 3},
    "스티커": {"price": 1000, "stock": 6}
}
orders = [("키링", 2), ("키링", -1), ("없는상품", 1), ("키링", 1), ("키링", 1)]
revenue = 0
history = []

def sell(name, quantity):
    global revenue
    if name not in products:
        print("없는 상품:", name)
        return
    if type(quantity) is not int or quantity < 1:
        print("수량은 1 이상의 정수여야 합니다.")
        return
    item = products[name]
    if quantity > item["stock"]:
        print("재고 부족:", name)
        return
    amount = item["price"] * quantity
    # TODO: 선택한 기능이 할인이라면 이곳에 계산을 추가합니다.
    item["stock"] -= quantity
    revenue += amount
    history.append({"name": name, "quantity": quantity, "amount": amount})
    print(name, quantity, "개 판매:", amount, "원")
    # TODO: 품절 알림이나 영수증을 추가합니다.

for name, quantity in orders:
    sell(name, quantity)
print("하루 매출:", revenue)
print("성공한 판매:", history)
# TODO: 선택한 기능이 베스트 상품이라면 판매 수량을 집계합니다.`,
 javaFirst:`public class Main {
    public static void main(String[] args) {
        String product = "키링";
        int price = 4000;
        int quantity = 2;
        int total = price * quantity;
        System.out.println(product + " " + quantity + "개: " + total + "원");
    }
}`,
 javaProject:`public class Main {
    // 의뢰: 뱃지 단가 2000원, 컬러 인쇄는 개당 500원 추가.
    // 수량은 1~100개. 상품 금액 20000원 미만은 배송비 3000원.
    // 정상/오류/경계 조건을 직접 확인하세요.
    static int quote(int quantity, boolean color) {
        if (quantity < 1 || quantity > 100) {
            throw new IllegalArgumentException("수량은 1~100개입니다.");
        }
        int unitPrice = 2000;
        if (color) {
            unitPrice += 500;
        }
        int subtotal = unitPrice * quantity;
        // TODO: 20000원 미만이면 배송비 3000원을 더합니다.
        int shipping = 0;
        return subtotal + shipping;
    }
    public static void main(String[] args) {
        int[] quantities = {4, 8, 10, 0, 101};
        for (int quantity : quantities) {
            try {
                System.out.println(quantity + "개: " + quote(quantity, true) + "원");
            } catch (IllegalArgumentException error) {
                System.out.println("주문 거절: " + error.getMessage());
            }
        }
    }
}`,
 javaComplete:`public class Main {
    static int quote(int quantity, boolean color) {
        if (quantity < 1 || quantity > 100) {
            throw new IllegalArgumentException("수량은 1~100개입니다.");
        }
        int unitPrice = color ? 2500 : 2000;
        int subtotal = unitPrice * quantity;
        int shipping = subtotal < 20000 ? 3000 : 0;
        return subtotal + shipping;
    }
    public static void main(String[] args) {
        int[] quantities = {4, 8, 10, 0, 101};
        for (int quantity : quantities) {
            try {
                System.out.println(quantity + "개: " + quote(quantity, true) + "원");
            } catch (IllegalArgumentException error) {
                System.out.println("주문 거절: " + error.getMessage());
            }
        }
    }
}`
};
window.makeWebGame = (settings={}) => `<!doctype html>
<html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>작은 수집가</title><style>
*{box-sizing:border-box}body{margin:0;background:#eef0e4;color:#25392e;font:15px/1.6 system-ui,sans-serif;padding:18px}main{max-width:620px;margin:auto}h1{font-size:25px;margin:0}p{font-size:13px;margin:7px 0 14px}canvas{width:100%;height:auto;background:#dce5ce;border:1px solid #a4b79a;display:block;touch-action:none;border-radius:5px}.bar{display:flex;justify-content:space-between;gap:10px;margin:10px 0;font-size:14px}button{border:0;background:#234d3a;color:white;padding:10px 18px;font:inherit;border-radius:4px;cursor:pointer}#message{min-height:25px;font-weight:600}kbd{background:white;border:1px solid #bdc9b6;border-radius:3px;padding:0 5px}</style>
<main><h1>작은 수집가</h1><p><kbd>←</kbd> <kbd>→</kbd> 또는 마우스·터치로 이동하세요. 초록 조각은 +1점, 주황 조각에 닿으면 체력이 줄어요.</p><div class="bar"><span id="score">점수 0</span><span id="life">체력 ${settings.life||3}</span><span id="time">남은 시간 30초</span></div><canvas width="600" height="300" tabindex="0" aria-label="작은 수집가 게임. 방향키 또는 포인터로 이동"></canvas><p id="message" role="status">30초 동안 10점 모으기에 도전하세요.</p><button id="start">시작하기</button></main>
<script>
// 아래 세 숫자 중 하나를 바꾼 뒤, 이전 기록과 비교하세요.
const SETTINGS = {speed: ${settings.speed||150}, interval: ${settings.interval||650}, life: ${settings.life||3}};
const canvas=document.querySelector('canvas'),ctx=canvas.getContext('2d');
const scoreEl=document.querySelector('#score'),lifeEl=document.querySelector('#life'),timeEl=document.querySelector('#time'),message=document.querySelector('#message');
let playing=false,score=0,life=SETTINGS.life,elapsed=0,last=0,startedAt=0,endTimer=0,spawn=0,items=[],x=300,left=false,right=false,seed=71,frameId=0;
function random(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
function draw(){ctx.clearRect(0,0,600,300);ctx.strokeStyle='#c5d2b9';for(let i=0;i<600;i+=40){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,300);ctx.stroke();}ctx.fillStyle='#234d3a';ctx.fillRect(x-19,257,38,21);ctx.fillStyle='#f1dc77';ctx.fillRect(x-12,252,24,6);for(const item of items){ctx.fillStyle=item.bad?'#c86442':'#528656';ctx.beginPath();ctx.arc(item.x,item.y,item.bad?11:9,0,Math.PI*2);ctx.fill();}}
function finish(){if(!playing)return;elapsed=Math.min(30,(performance.now()-startedAt)/1000);playing=false;clearTimeout(endTimer);cancelAnimationFrame(frameId);const survived=life>0;message.textContent=survived?(score>=10?'목표 달성! '+score+'점입니다.':'시간 종료! '+score+'점입니다. 규칙을 바꿔 다시 해 보세요.'):'체력이 모두 줄었습니다. '+score+'점, '+elapsed.toFixed(1)+'초 생존';timeEl.textContent='남은 시간 '+Math.max(0,Math.ceil(30-elapsed))+'초';document.querySelector('#start').textContent='다시 하기';parent.postMessage({channel:'busanhc-game',type:'result',score,life,seconds:Math.round(elapsed*10)/10,settings:SETTINGS},'*');}
function frame(now){if(!playing)return;const dt=Math.min((now-last)/1000,.05);last=now;elapsed=(now-startedAt)/1000;spawn+=dt*1000;x=Math.max(20,Math.min(580,x+(right-left)*310*dt));if(spawn>=SETTINGS.interval){spawn=0;items.push({x:25+random()*550,y:-15,bad:random()<.38});}for(const item of items){item.y+=SETTINGS.speed*dt;if(item.y>245&&item.y<285&&Math.abs(item.x-x)<29){if(item.bad)life--;else score++;item.y=400;}}items=items.filter(i=>i.y<330);scoreEl.textContent='점수 '+score;lifeEl.textContent='체력 '+Math.max(0,life);timeEl.textContent='남은 시간 '+Math.max(0,Math.ceil(30-elapsed))+'초';draw();if(life<=0||elapsed>=30){finish();return;}frameId=requestAnimationFrame(frame);}
document.querySelector('#start').onclick=()=>{cancelAnimationFrame(frameId);clearTimeout(endTimer);playing=true;score=0;life=SETTINGS.life;elapsed=0;spawn=0;items=[];x=300;seed=71;left=false;right=false;last=performance.now();startedAt=last;endTimer=setTimeout(finish,30000);message.textContent='초록 조각을 모으고, 주황 조각을 피하세요.';document.querySelector('#start').textContent='처음부터';canvas.focus();frameId=requestAnimationFrame(frame);};
addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();if(e.key==='ArrowLeft')left=true;else right=true;}});addEventListener('keyup',e=>{if(e.key==='ArrowLeft')left=false;if(e.key==='ArrowRight')right=false;});addEventListener('blur',()=>{left=false;right=false;});
canvas.addEventListener('pointermove',e=>{if(!playing)return;const r=canvas.getBoundingClientRect();x=Math.max(20,Math.min(580,(e.clientX-r.left)/r.width*600));});canvas.addEventListener('pointerdown',e=>{canvas.focus();canvas.setPointerCapture(e.pointerId);const r=canvas.getBoundingClientRect();x=Math.max(20,Math.min(580,(e.clientX-r.left)/r.width*600));});draw();
<\/script></html>`;
