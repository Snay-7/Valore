with open("app/page.tsx", "r") as f:
    content = f.read()

old_pricing = '''            {[
              {name:"Starter",price:"£79",period:"/mo",desc:"For independent developers and investors getting started.",features:["Up to 5 active projects","All 4 asset types (BTR, BTS, Hotel, Flip)","True monthly CF engine","DSCR / ICR & equity multiple","Plain PDF export","Deal Pipeline & Tasks","Live share links","14-day free trial"],featured:false,cta:"Start Free Trial"},
              {name:"Professional",price:"£199",period:"/mo",desc:"For serious developers and investment teams.",features:["Unlimited projects","All 4 asset types","True monthly CF engine","DSCR / ICR, MOIC & break-even","Team Workspace collaboration","AI Brochure PDF","AI Sense Check","Priority support","14-day free trial"],featured:true,cta:"Start Free Trial"},
              {name:"Enterprise",price:"£499",period:"/mo",desc:"For PropTech firms, agencies and institutional teams.",features:["Everything in Professional","Multi-firm workspace","White label PDF exports","Custom benchmarks","Dedicated onboarding","SLA support"],featured:false,cta:"Start Free Trial"},
            ].map((plan,i)=>('''

new_pricing = '''            {[
              {name:"Starter",price:"£79",period:"/mo",desc:"For independent developers and investors getting started.",features:["Up to 10 active projects","All 4 asset types (BTR, BTS, Hotel, Flip)","True monthly CF engine","DSCR / ICR & equity multiple","Deal Pipeline, Tasks & Notes","Live share links","Plain PDF export","14-day Enterprise trial included"],featured:false,cta:"Start Free Trial"},
              {name:"Professional",price:"£199",period:"/mo",desc:"For serious developers and investment teams.",features:["Unlimited projects","All 4 asset types","True monthly CF engine","DSCR / ICR, MOIC & break-even","Invite Pro collaborators","AI Brochure PDF","AI Sense Check","Priority support","14-day Enterprise trial included"],featured:true,cta:"Start Free Trial"},
              {name:"Enterprise",price:"£499",period:"/mo",desc:"For PropTech firms, agencies and institutional teams.",features:["Everything in Professional","Full team workspace with roles","Multi-firm workspace","White label PDF exports","Custom benchmarks","Dedicated onboarding","SLA support"],featured:false,cta:"Start Free Trial"},
            ].map((plan,i)=>('''

# Also update the free tier description in hero stats
old_hero_stats = '''                {[["£60bn+","GDV modelled"],["30,000+","Deals analysed"],["10","Benchmark rates"],["14 days","Free trial"]].map(([v,l])=>('''
new_hero_stats = '''                {[["£60bn+","GDV modelled"],["30,000+","Deals analysed"],["10","Benchmark rates"],["14 days","Enterprise trial"]].map(([v,l])=>('''

results = []

if old_pricing in content:
    content = content.replace(old_pricing, new_pricing)
    results.append("✅ Pricing tiers updated")
else:
    results.append("❌ Pricing section not found")

if old_hero_stats in content:
    content = content.replace(old_hero_stats, new_hero_stats)
    results.append("✅ Hero stats updated")
else:
    results.append("❌ Hero stats not found")

with open("app/page.tsx", "w") as f:
    f.write(content)

for r in results:
    print(r)
