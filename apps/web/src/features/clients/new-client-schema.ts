import { z } from "zod";

export const newClientFormSchema = z.object({
  name: z.string().trim().min(1, "Business name is required."),
  whatsappPhoneNumberId: z.string().optional(),
  whatsappAccessToken: z.string().optional(),
  whatsappVerifyToken: z.string().optional(),
});

export type NewClientFormValues = z.infer<typeof newClientFormSchema>;
