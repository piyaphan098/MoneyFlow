import Link from "next/link";

export const metadata = { title: "นโยบายความเป็นส่วนตัว · MoneyFlow" };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-mf-bg">
      <div className="max-w-2xl mx-auto px-5 py-10 sm:py-14">
        <Link href="/" className="text-sm text-mf-primary font-medium">← กลับหน้าหลัก</Link>

        <div className="mt-6 flex items-center gap-2">
          <img src="/logo.png" alt="MoneyFlow" className="w-9 h-9 rounded-xl object-cover" />
          <p className="font-bold">MoneyFlow</p>
        </div>

        <h1 className="text-2xl font-bold mt-6 mb-1">นโยบายความเป็นส่วนตัว</h1>
        <p className="text-sm text-mf-sub mb-8">ปรับปรุงล่าสุด: กันยายน 2569</p>

        <div className="space-y-7 text-sm leading-relaxed text-mf-text">
          <section>
            <h2 className="font-semibold text-base mb-2">1. บทนำ</h2>
            <p>
              MoneyFlow ("เรา") เป็นเว็บแอปพลิเคชันสำหรับบันทึกและติดตามรายรับ-รายจ่าย
              หนี้สิน และค่าใช้จ่ายประจำส่วนบุคคล นโยบายนี้อธิบายว่าเราเก็บ ใช้
              และดูแลข้อมูลของคุณอย่างไรเมื่อใช้บริการของเรา
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-2">2. ข้อมูลที่เราเก็บรวบรวม</h2>
            <ul className="list-disc list-inside space-y-1">
              <li><b>ข้อมูลบัญชี:</b> อีเมล และรหัสผ่าน (จัดเก็บแบบเข้ารหัสโดย Supabase Auth เราไม่เห็นรหัสผ่านจริงของคุณ)</li>
              <li><b>ข้อมูลการเงินที่คุณกรอกเอง:</b> รายการรายรับ-รายจ่าย หนี้สิน ค่าใช้จ่ายประจำ และหมายเหตุที่เกี่ยวข้อง</li>
              <li><b>ข้อมูลการเชื่อมต่อ LINE (ถ้าเปิดใช้):</b> LINE User ID และข้อความที่คุณส่งเข้ามาบันทึกรายการผ่านแชท</li>
              <li><b>ข้อมูลทางเทคนิคพื้นฐาน:</b> เช่น เวลาที่เข้าสู่ระบบ สำหรับดูแลความปลอดภัยของบัญชี</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-2">3. เราใช้ข้อมูลของคุณเพื่ออะไร</h2>
            <p>
              ใช้เพื่อให้บริการฟีเจอร์หลักของแอปเท่านั้น — แสดงภาพรวมการเงิน คำนวณสรุป
              แจ้งเตือนวันครบกำหนดชำระ และบันทึกรายการผ่านช่องทางที่คุณเลือก (เว็บหรือ LINE)
              เราไม่นำข้อมูลของคุณไปใช้เพื่อโฆษณา ไม่ขาย ไม่ให้เช่า และไม่แบ่งปันข้อมูลการเงินส่วนบุคคลของคุณ
              ให้บุคคลที่สามเพื่อวัตถุประสงค์ทางการตลาด
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-2">4. การแบ่งปันข้อมูลกับผู้ให้บริการภายนอก</h2>
            <p className="mb-2">
              เพื่อให้บริการทำงานได้ เราใช้ผู้ให้บริการภายนอกดังนี้ ซึ่งแต่ละรายมีนโยบาย
              ความเป็นส่วนตัวของตัวเอง:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li><b>Supabase</b> — จัดเก็บฐานข้อมูลและระบบยืนยันตัวตน</li>
              <li><b>Vercel</b> — โฮสต์เว็บแอปพลิเคชัน</li>
              <li><b>LINE</b> — เฉพาะกรณีที่คุณเลือกเชื่อมต่อบัญชี LINE ด้วยตัวเอง เพื่อรับส่งข้อความบันทึกรายการ</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-2">5. การรักษาความปลอดภัยของข้อมูล</h2>
            <p>
              ข้อมูลของคุณถูกจำกัดสิทธิ์การเข้าถึงด้วยระบบ Row Level Security ในระดับฐานข้อมูล
              — หมายความว่าผู้ใช้แต่ละคนจะเห็นได้เฉพาะข้อมูลของตัวเองเท่านั้น การเชื่อมต่อทั้งหมด
              ระหว่างเบราว์เซอร์กับเซิร์ฟเวอร์เข้ารหัสด้วย HTTPS
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-2">6. สิทธิของคุณ</h2>
            <p>
              คุณสามารถเข้าถึง แก้ไข หรือลบรายการข้อมูลของคุณได้ด้วยตัวเองตลอดเวลาผ่านหน้าเว็บแอป
              หากต้องการลบบัญชีและข้อมูลทั้งหมดอย่างถาวร กรุณาติดต่อเราตามช่องทางด้านล่าง
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-2">7. คุกกี้</h2>
            <p>
              เราใช้คุกกี้เท่าที่จำเป็นสำหรับการคงสถานะการเข้าสู่ระบบ (session) เท่านั้น
              ไม่มีการใช้คุกกี้เพื่อติดตามพฤติกรรมหรือโฆษณา
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-2">8. การเปลี่ยนแปลงนโยบาย</h2>
            <p>
              เราอาจปรับปรุงนโยบายนี้เป็นครั้งคราว หากมีการเปลี่ยนแปลงสำคัญ
              จะแจ้งให้ทราบผ่านหน้าเว็บแอปพลิเคชัน
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-2">9. ติดต่อเรา</h2>
            <p>หากมีข้อสงสัยเกี่ยวกับนโยบายความเป็นส่วนตัวนี้ สามารถติดต่อผู้ดูแลระบบ MoneyFlow ได้โดยตรง</p>
          </section>
        </div>
      </div>
    </div>
  );
}
