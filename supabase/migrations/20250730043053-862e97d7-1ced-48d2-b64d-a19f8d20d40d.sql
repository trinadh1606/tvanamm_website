-- Update blog_posts table with better sample content
UPDATE blog_posts SET
  content = CASE 
    WHEN title LIKE '%Health Benefits%' THEN 
      'Tea has been cherished for centuries not just for its delightful taste, but for its incredible health benefits. At T VANAMM, we believe in bringing you the finest quality tea that nourishes both body and soul.

**Rich in Antioxidants**
Our premium teas are packed with powerful antioxidants called polyphenols, which help fight free radicals in your body. These compounds play a crucial role in:
- Reducing inflammation
- Supporting heart health
- Boosting immune system
- Protecting against cellular damage

**Mental Wellness**
The natural compounds in tea, particularly L-theanine, promote relaxation without drowsiness. Regular tea consumption has been linked to:
- Improved focus and concentration
- Reduced stress and anxiety
- Better sleep quality
- Enhanced mood and mental clarity

**Heart Health**
Studies have shown that regular tea consumption can:
- Lower blood pressure
- Reduce cholesterol levels
- Improve blood vessel function
- Decrease risk of heart disease

**Weight Management**
Certain varieties of tea can boost metabolism and aid in weight management:
- Green tea increases fat burning
- Oolong tea helps block carbohydrate absorption
- Pu-erh tea supports healthy digestion

**Digestive Health**
Tea has natural properties that support digestive wellness:
- Soothes stomach irritation
- Promotes healthy gut bacteria
- Aids in digestion after meals
- Reduces bloating and discomfort

At T VANAMM, we source our teas from the finest gardens, ensuring that every cup delivers maximum health benefits. Our franchise partners across India are committed to sharing these wellness benefits with their communities.

Join the T VANAMM family and experience the transformative power of premium tea. Visit your nearest franchise or contact us to learn more about our health-focused tea selections.',
    
    WHEN title LIKE '%Perfect Cup%' THEN 
      'Brewing the perfect cup of tea is an art that combines science, tradition, and personal preference. At T VANAMM, we''ve perfected this art over years of experience, and we''re excited to share our secrets with you.

**Understanding Your Tea**
Different types of tea require different brewing methods:

**Black Tea**
- Water temperature: 95-100°C (200-212°F)
- Steeping time: 3-5 minutes
- Tea amount: 1 teaspoon per cup
- Best served: With or without milk and sugar

**Green Tea**
- Water temperature: 70-80°C (160-175°F)
- Steeping time: 1-3 minutes
- Tea amount: 1 teaspoon per cup
- Best served: Plain or with light honey

**White Tea**
- Water temperature: 75-85°C (165-185°F)
- Steeping time: 2-4 minutes
- Tea amount: 1-2 teaspoons per cup
- Best served: Plain to appreciate delicate flavors

**Oolong Tea**
- Water temperature: 85-95°C (185-200°F)
- Steeping time: 3-5 minutes
- Tea amount: 1 teaspoon per cup
- Best served: Plain or with light sweetener

**The T VANAMM Method**

1. **Start with Fresh Water**: Always use fresh, cold water. Avoid re-boiling water as it reduces oxygen content.

2. **Warm Your Teapot**: Rinse your teapot with hot water before adding tea leaves.

3. **Measure Carefully**: Use the right amount of tea - too little results in weak tea, too much makes it bitter.

4. **Time It Right**: Set a timer to avoid over-steeping, which can make tea bitter.

5. **Strain Properly**: Remove tea leaves or bags promptly when steeping time is complete.

**Pro Tips from Our Master Tea Blenders**

- Store tea in airtight containers away from light and moisture
- Never squeeze tea bags as it releases tannins and makes tea bitter
- Experiment with steeping times to find your perfect strength
- Try multiple infusions with high-quality loose leaf teas
- Pair different teas with appropriate foods for enhanced experience

**Common Mistakes to Avoid**

- Using boiling water for delicate teas
- Over-steeping any type of tea
- Adding milk to green or white teas
- Using stale or old tea leaves
- Not preheating your teacup or teapot

**The T VANAMM Difference**
Our franchise partners are trained in the art of tea brewing. They use premium equipment and follow our time-tested methods to ensure every cup served meets our exacting standards.

Visit your nearest T VANAMM franchise to experience the perfect cup, or contact us to learn about our franchise opportunities and bring this expertise to your community.',
    
    WHEN title LIKE '%Franchise Success%' THEN 
      'The journey of building a successful T VANAMM franchise is filled with determination, community spirit, and the shared passion for premium tea. Today, we''re proud to share the inspiring story of Priya Sharma, whose T VANAMM franchise in Pune has become a beacon of success and community connection.

**From Dream to Reality**
Priya always dreamed of owning her own business, but the traditional retail models seemed overwhelming and risky. When she discovered T VANAMM''s franchise opportunity, she saw the perfect blend of entrepreneurship and established business support.

"I was immediately drawn to T VANAMM''s commitment to quality and their comprehensive franchise support system," recalls Priya. "The initial training program gave me confidence, and the ongoing support has been invaluable."

**The First Year Journey**
Starting a franchise is never without challenges, but Priya''s dedication and T VANAMM''s proven business model helped her navigate the initial hurdles:

**Month 1-3: Foundation Building**
- Completed comprehensive training program
- Set up the store with T VANAMM''s guidance
- Built relationships with local suppliers
- Launched community awareness campaigns

**Month 4-6: Community Engagement**
- Organized tea tasting events
- Partnered with local businesses
- Developed a loyal customer base
- Implemented customer feedback systems

**Month 7-12: Growth and Expansion**
- Achieved break-even point in month 8
- Expanded product range based on local preferences
- Hired additional staff
- Exceeded first-year sales targets by 25%

**Keys to Success**

**1. Community Focus**
Priya understood that success comes from serving the community. She organized:
- Weekly tea education sessions
- Health and wellness workshops
- Cultural events centered around tea
- Partnerships with local health practitioners

**2. Quality Commitment**
Never compromising on T VANAMM''s quality standards:
- Regular quality checks on all products
- Proper storage and handling procedures
- Staff training on product knowledge
- Customer education about premium tea benefits

**3. Customer Relationships**
Building lasting relationships beyond transactions:
- Remembering regular customers'' preferences
- Celebrating customers'' special occasions
- Creating a welcoming store atmosphere
- Providing personalized tea recommendations

**4. Business Innovation**
Adapting to local market needs while maintaining brand standards:
- Introducing region-specific tea blends
- Offering home delivery services
- Creating corporate gift packages
- Developing loyalty programs

**The Results**
Today, Priya''s franchise serves over 500 regular customers and has become a community hub. Her success metrics speak volumes:

- 150% growth in second year
- 95% customer retention rate
- Featured as T VANAMM''s "Franchise of the Year"
- Plans to open a second location

**Words of Wisdom**
"Success doesn''t happen overnight," Priya advises new franchisees. "Stay committed to quality, listen to your customers, and trust the T VANAMM system. The support team is always there when you need them."

**Your Success Story Awaits**
Priya''s journey is just one of many success stories in the T VANAMM family. With our proven business model, comprehensive training, and ongoing support, you too can build a thriving business while serving your community.

Contact us today to learn more about T VANAMM franchise opportunities. Your success story could be next!'
    
    ELSE content
  END,
  excerpt = CASE 
    WHEN title LIKE '%Health Benefits%' THEN 
      'Discover the incredible health benefits of premium tea and how T VANAMM''s carefully sourced selections can enhance your wellness journey with antioxidants, mental clarity, and natural healing properties.'
    WHEN title LIKE '%Perfect Cup%' THEN 
      'Master the art of tea brewing with our comprehensive guide covering water temperature, steeping times, and expert techniques for every type of tea from our master blenders.'
    WHEN title LIKE '%Franchise Success%' THEN 
      'Follow Priya Sharma''s inspiring journey from dream to successful T VANAMM franchise owner, including challenges overcome, strategies implemented, and remarkable growth achieved.'
    ELSE excerpt
  END,
  tags = CASE 
    WHEN title LIKE '%Health Benefits%' THEN 
      ARRAY['health', 'wellness', 'antioxidants', 'natural healing', 'immunity']
    WHEN title LIKE '%Perfect Cup%' THEN 
      ARRAY['brewing', 'techniques', 'quality', 'temperature', 'steeping']
    WHEN title LIKE '%Franchise Success%' THEN 
      ARRAY['franchise', 'business', 'success story', 'entrepreneurship', 'community']
    ELSE tags
  END
WHERE title LIKE '%Health Benefits%' OR title LIKE '%Perfect Cup%' OR title LIKE '%Franchise Success%';

-- Enable realtime for blog_posts
ALTER TABLE blog_posts REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE blog_posts;

-- Enable realtime for testimonials
ALTER TABLE testimonials REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE testimonials;

-- Enable realtime for notifications
ALTER TABLE notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;