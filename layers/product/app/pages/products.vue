<script setup lang="ts">
import type { Product } from '#layers/product/server/db/schema'
import type { CreateProduct, UpdateProduct } from '#layers/product/shared/schemas/product'
import { useProductApi } from '#layers/product/app/api/useProductApi'
import ProductForm from '#layers/product/app/components/Product/ProductForm.vue'
import ProductList from '#layers/product/app/components/Product/ProductList.vue'
import { productsKey } from '#layers/product/app/composables/useProducts'
import DashboardNavbar from '~/components/Dashboard/DashboardNavbar.vue'

definePageMeta({ can: ['product:write', 'product:manage'] })
useHead({ title: 'Products' })

const api = useProductApi()
const toast = useToast()

const saving = ref(false)
const modalOpen = ref(false)
const editingProduct = ref<Product | null>(null)

const { data: products, status, error, refresh } = useAsyncData<Product[]>('products', () => api.fetchProducts(), { default: (): Product[] => [] })
whenError(error)

const loading = computed(() => status.value === 'pending')

provide(productsKey, {
  products,
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
})

async function fetchProducts() {
  await refresh()
}

function openCreate() {
  editingProduct.value = null
  modalOpen.value = true
}

function openEdit(product: Product) {
  editingProduct.value = product
  modalOpen.value = true
}

async function handleSubmit(values: CreateProduct | UpdateProduct) {
  saving.value = true
  try {
    const isEdit = !!editingProduct.value
    if (editingProduct.value) {
      await api.updateProduct(editingProduct.value.id, values as UpdateProduct)
    }
    else {
      await api.createProduct(values as CreateProduct)
    }
    await refresh()
    modalOpen.value = false
    toast.add({ title: isEdit ? 'Product updated' : 'Product created', color: 'success' })
  }
  catch (err: unknown) {
    const e = err as { data?: { statusMessage?: string } }
    toast.add({ title: 'Error', description: e?.data?.statusMessage ?? 'Unknown error', color: 'error' })
  }
  finally {
    saving.value = false
  }
}

async function createProduct(body: CreateProduct) {
  return api.createProduct(body)
}

async function updateProduct(id: string, body: UpdateProduct) {
  return api.updateProduct(id, body)
}

async function deleteProduct(id: string) {
  await api.deleteProduct(id)
  await refresh()
}

async function handleDelete(product: Product) {
  try {
    await deleteProduct(product.id)
    toast.add({ title: 'Product deleted', color: 'success' })
  }
  catch (err: unknown) {
    const e = err as { data?: { statusMessage?: string } }
    toast.add({ title: 'Error', description: e?.data?.statusMessage ?? 'Unknown error', color: 'error' })
  }
}
</script>

<template>
  <UDashboardPanel id="products">
    <template #header>
      <DashboardNavbar title="Products">
        <template #right>
          <UButton icon="i-lucide-plus" label="New product" @click="openCreate()" />
        </template>
      </DashboardNavbar>
    </template>
    <template #body>
      <div class="max-w-3xl mx-auto p-4">
        <ProductList
          :products="products"
          :loading="loading"
          @edit="openEdit"
          @delete="handleDelete"
        />
      </div>
    </template>
  </UDashboardPanel>

  <UModal
    v-model:open="modalOpen"
    :title="editingProduct ? 'Edit product' : 'New product'"
    :ui="{ body: 'overflow-y-auto max-h-[80vh]' }"
  >
    <template #body>
      <ProductForm
        :initial-values="editingProduct ? { ...editingProduct, description: editingProduct.description ?? undefined } : undefined"
        :loading="saving"
        @submit="handleSubmit"
        @cancel="modalOpen = false"
      />
    </template>
  </UModal>
</template>
