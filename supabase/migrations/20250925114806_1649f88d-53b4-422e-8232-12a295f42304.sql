-- Assign the approved farmer to the Free (Starter) pricing plan
INSERT INTO public.farm_pricing_plans (user_id, pricing_plan_id, assigned_by, is_active)
SELECT 
  'd1009563-0f50-40ae-b87f-74065eab5f57' as user_id,
  pp.id as pricing_plan_id,
  '07b78830-836e-47b9-99ee-75e6ea4837eb' as assigned_by,
  true as is_active
FROM public.pricing_plans pp
WHERE pp.name = 'Free (Starter)'
AND NOT EXISTS (
  SELECT 1 FROM public.farm_pricing_plans fpp 
  WHERE fpp.user_id = 'd1009563-0f50-40ae-b87f-74065eab5f57'
);