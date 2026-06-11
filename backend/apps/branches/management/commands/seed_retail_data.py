import random
from datetime import datetime, timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db import transaction
from apps.branches.models import Branch, BranchSettings
from apps.users.models import CustomUser
from apps.products.models import Category, Product, ProductVariant
from apps.inventory.models import Stock, StockMovement
from apps.customers.models import Customer
from apps.sales.models import Sale, SaleItem, Payment

class Command(BaseCommand):
    help = "Seeds the database with H&M retail analysis dataset statistics."

    def handle(self, *args, **options):
        self.stdout.write("Starting transaction atomic seed...")
        
        with transaction.atomic():
            self.stdout.write("Clearing existing data...")
            Payment.objects.all().delete()
            SaleItem.objects.all().delete()
            Sale.objects.all().delete()
            StockMovement.objects.all().delete()
            Stock.objects.all().delete()
            ProductVariant.objects.all().delete()
            Product.objects.all().delete()
            Category.objects.all().delete()
            Customer.objects.all().delete()
            BranchSettings.objects.all().delete()
            Branch.objects.all().delete()

            self.stdout.write("Creating branches...")
            branches_data = [
                {"name": "القاهرة الرئيسي", "address": "وسط البلد، القاهرة", "phone": "0225789456", "email": "cairo@fashionchain.com"},
                {"name": "الجيزة والمهندسين", "address": "شارع جامعة الدول، المهندسين", "phone": "0237612345", "email": "giza@fashionchain.com"},
                {"name": "المعادي الفاخر", "address": "دجلة، المعادي", "phone": "0225198765", "email": "maadi@fashionchain.com"},
                {"name": "الإسكندرية", "address": "طريق الجيش، الإسكندرية", "phone": "035824681", "email": "alex@fashionchain.com"},
            ]
            
            branches = []
            for b_data in branches_data:
                branch = Branch.objects.create(**b_data)
                BranchSettings.objects.create(branch=branch, tax_rate=14, currency="EGP")
                branches.append(branch)
                self.stdout.write(f"Created branch: {branch.name}")

            # Assign/create managers
            # 1. bilal user
            bilal, created_bilal = CustomUser.objects.get_or_create(
                username="bilal",
                defaults={"email": "bilaltareq20055@gmail.com", "role": CustomUser.Role.BRANCH_MANAGER}
            )
            if created_bilal:
                bilal.set_password("12345678")
            bilal.branch = branches[0] # Cairo Main Branch
            bilal.role = CustomUser.Role.BRANCH_MANAGER
            bilal.save()
            self.stdout.write(f"Assigned user {bilal.username} to branch {branches[0].name}")

            # 2. mee user (Giza branch manager)
            mee = CustomUser.objects.filter(username="mee").first()
            if mee:
                mee.branch = branches[1] # Giza Branch
                mee.role = CustomUser.Role.BRANCH_MANAGER
                mee.save()
                self.stdout.write(f"Assigned user {mee.username} to branch {branches[1].name}")

            # 3. Delete cashier user "go"
            CustomUser.objects.filter(username="go").delete()
            self.stdout.write("Deleted cashier user 'go' from database.")

            self.stdout.write("Creating categories...")
            categories_map = {}
            for cat_name in ["Ladieswear", "Divided", "Baby/Children", "Menswear", "Sport"]:
                category = Category.objects.create(name=cat_name)
                categories_map[cat_name] = category
                self.stdout.write(f"Created category: {cat_name}")

            self.stdout.write("Creating products and variants...")
            products_spec = [
                ("Ladieswear", "كنزة تريكو كلاسيكية", 550.00, 300.00, "كنزة صوفية كلاسيكية ناعمة ودافئة بألوان متعددة"),
                ("Ladieswear", "فستان صيفي حريري", 750.00, 400.00, "فستان صيفي من الحرير الخالص بتصميم مريح"),
                ("Ladieswear", "بلوزة شيفون أنيقة", 450.00, 240.00, "بلوزة شيفون مناسبة للعمل والمناسبات الرسمية"),
                ("Ladieswear", "بنطال جينز سليم", 500.00, 270.00, "بنطال جينز نسائي ضيق ومريح بخصر مرتفع"),
                ("Divided", "هودي قطني كاجوال", 390.00, 200.00, "هودي رياضي قطني مع قلنسوة وتصميم عصري"),
                ("Divided", "تيشرت كروب توب", 190.00, 100.00, "تيشرت شبابي قصير بقصة مريحة وألوان صيفية"),
                ("Divided", "بنطال جينز كارجو", 490.00, 260.00, "بنطال جينز كارجو واسع بجيوب جانبية مريحة"),
                ("Menswear", "قميص أكسفورد رسمي", 500.00, 270.00, "قميص رسمي للرجال مصنوع من قطن الأكسفورد الفاخر"),
                ("Menswear", "بنطال تشينو كلاسيك", 450.00, 240.00, "بنطال تشينو رجالي مريح للارتداء اليومي"),
                ("Menswear", "معطف صوف شتوي", 1200.00, 650.00, "معطف صوف طويل بتصميم كلاسيكي دافئ"),
                ("Baby/Children", "بيجامة قطن للأطفال", 250.00, 120.00, "طقم بيجامة قطنية ناعمة ومريحة للأطفال"),
                ("Baby/Children", "سترة شتوية مبطنة", 600.00, 300.00, "سترة شتوية دافئة مبطنة بالفرو للأطفال"),
                ("Sport", "بنطال ضيق للتمارين", 450.00, 220.00, "بنطال رياضي ضيق بخصر مرتفع ومرونة عالية"),
                ("Sport", "تيشرت بوليستر جاف", 290.00, 140.00, "تيشرت تمارين بوليستر سريع الجفاف وخفيف"),
            ]

            variants = []
            sizes = ["S", "M", "L", "XL"]
            colors = ["Black", "White", "Blue", "Light Pink", "Dark Green"]

            for cat_name, prod_name, price, cost_price, desc in products_spec:
                category = categories_map[cat_name]
                product = Product.objects.create(name=prod_name, category=category, description=desc)
                
                selected_sizes = random.sample(sizes, 3)
                selected_colors = random.sample(colors, 3)
                
                variant_idx = 1
                for size in selected_sizes:
                    for color in selected_colors:
                        sku = f"SKU-{product.id:03d}-{size}-{color.upper()[:3]}"
                        barcode = f"BAR-{product.id:03d}{variant_idx:04d}"
                        var_price = price + (10 if size in ["L", "XL"] else 0)
                        var_cost = cost_price + (5 if size in ["L", "XL"] else 0)
                        
                        variant = ProductVariant.objects.create(
                            product=product,
                            size=size,
                            color=color,
                            sku=sku,
                            barcode=barcode,
                            price=var_price,
                            cost_price=var_cost
                        )
                        variants.append(variant)
                        variant_idx += 1

            self.stdout.write("Creating stocks...")
            stocks = []
            for branch in branches:
                for variant in variants:
                    prob = random.random()
                    if prob < 0.08:
                        qty = random.randint(0, 3)
                    elif prob < 0.12:
                        qty = 0
                    else:
                        qty = random.randint(15, 65)

                    stock = Stock.objects.create(
                        branch=branch,
                        variant=variant,
                        quantity=qty,
                        min_quantity=5
                    )
                    stocks.append(stock)

            self.stdout.write("Creating customers...")
            customer_names = [
                "أحمد علي", "سارة محمد", "كريم حسام", "منى أحمد", "عمر خالد",
                "مريم محمود", "طارق زكي", "هدى حسن", "يوسف عمر", "نهى شريف",
                "خالد يحيى", "ليلى شادي", "مصطفى كامل", "نوران شريف", "شريف منير",
                "دينا فؤاد", "عبدالرحمن علي", "ملك ياسر", "ياسين هشام", "فريدة مصطفى"
            ]
            customers = []
            for idx, name in enumerate(customer_names):
                phone = f"010{random.randint(10000000, 99999999)}"
                email = f"customer{idx+1}@example.com"
                customer = Customer.objects.create(
                    branch=random.choice(branches),
                    name=name,
                    phone=phone,
                    email=email,
                    loyalty_points=random.randint(50, 1200),
                    total_purchases=0
                )
                customers.append(customer)

            self.stdout.write("Generating sales transactions...")
            total_sales_generated = 0
            current_time = timezone.now()
            admin_user = CustomUser.objects.filter(role="OWNER").first()

            for day_offset in range(30, -1, -1):
                target_date = current_time - timedelta(days=day_offset)
                is_weekend = target_date.weekday() in [4, 5]
                sales_count = random.randint(12, 25) if is_weekend else random.randint(5, 15)

                for _ in range(sales_count):
                    branch = random.choice(branches)
                    customer = random.choice(customers) if random.random() < 0.6 else None
                    sold_by = bilal if (branch == branches[0] and bilal) else admin_user

                    status = Sale.Status.COMPLETED
                    prob_status = random.random()
                    if prob_status < 0.03:
                        status = Sale.Status.REFUNDED
                    elif prob_status < 0.05:
                        status = Sale.Status.CANCELLED

                    sale = Sale.objects.create(
                        branch=branch,
                        customer=customer,
                        sold_by=sold_by,
                        status=status,
                        subtotal=0,
                        discount=0,
                        tax=0,
                        total=0
                    )

                    sale_hour = random.randint(9, 22)
                    sale_minute = random.randint(0, 59)
                    sale_second = random.randint(0, 59)
                    sale_time = target_date.replace(hour=sale_hour, minute=sale_minute, second=sale_second)
                    
                    items_count = random.randint(1, 3)
                    subtotal = 0
                    sale_items = []
                    
                    branch_stocks = [s for s in stocks if s.branch == branch]
                    selected_stocks = random.sample(branch_stocks, items_count)

                    for stock in selected_stocks:
                        qty = random.randint(1, 2)
                        if stock.quantity < qty:
                            continue
                        
                        price = stock.variant.price
                        total_price = price * qty
                        subtotal += total_price

                        stock.quantity -= qty
                        stock.save(update_fields=["quantity"])

                        item = SaleItem(
                            sale=sale,
                            variant=stock.variant,
                            quantity=qty,
                            unit_price=price,
                            total_price=total_price
                        )
                        sale_items.append(item)

                    if not sale_items:
                        sale.delete()
                        continue

                    SaleItem.objects.bulk_create(sale_items)

                    tax = subtotal * 0.14
                    total = subtotal + tax

                    sale.subtotal = subtotal
                    sale.tax = tax
                    sale.total = total
                    sale.save()

                    Sale.objects.filter(pk=sale.pk).update(created_at=sale_time)

                    pay_method = random.choice([Payment.Method.CASH, Payment.Method.CARD, Payment.Method.DIGITAL])
                    Payment.objects.create(sale=sale, method=pay_method, amount=total)

                    if customer and status == Sale.Status.COMPLETED:
                        customer.total_purchases += total
                        customer.loyalty_points += int(total * 0.05)
                        customer.save()

                    total_sales_generated += 1

            self.stdout.write(self.style.SUCCESS(f"Successfully seeded database with {total_sales_generated} sales!"))
